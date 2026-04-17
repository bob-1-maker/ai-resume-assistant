import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockReq, createMockRes } from '../helpers/httpMocks.js';

const executeQuery = jest.fn();
const sign = jest.fn();

jest.unstable_mockModule('../../config/turso.js', () => ({
  executeQuery
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign
  }
}));

process.env.ADMIN_USERNAME = 'admin';
process.env.ADMIN_PASSWORD = '123456';

const {
  login,
  getAllResumes,
  deleteResume
} = await import('../../controllers/adminController.js');

describe('adminController', () => {
  beforeEach(() => {
    executeQuery.mockReset();
    sign.mockReset();
  });

  describe('login', () => {
    it('returns 400 when username or password is missing', async () => {
      const req = createMockReq({ body: { username: '', password: '' } });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(sign).not.toHaveBeenCalled();
    });

    it('returns 401 when username is invalid', async () => {
      const req = createMockReq({
        body: { username: 'wrong-admin', password: '123456' }
      });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(sign).not.toHaveBeenCalled();
    });

    it('returns 401 when password is invalid', async () => {
      const req = createMockReq({
        body: { username: 'admin', password: 'wrong-password' }
      });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(sign).not.toHaveBeenCalled();
    });

    it('returns token and admin profile when login succeeds', async () => {
      const req = createMockReq({
        body: { username: 'admin', password: '123456' }
      });
      const res = createMockRes();
      sign.mockReturnValue('admin-token');

      await login(req, res);

      expect(sign).toHaveBeenCalledWith(
        { username: 'admin', isAdmin: true },
        expect.any(String),
        { expiresIn: '7d' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: {
          token: 'admin-token',
          user: {
            username: 'admin',
            isAdmin: true
          }
        }
      });
    });

    it('returns 500 when token signing fails', async () => {
      const req = createMockReq({
        body: { username: 'admin', password: '123456' }
      });
      const res = createMockRes();
      sign.mockImplementation(() => {
        throw new Error('sign error');
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 500, data: null })
      );
    });
  });

  describe('getAllResumes', () => {
    it('returns paginated global resume list', async () => {
      const req = createMockReq({
        query: { page: '2', pageSize: '5' }
      });
      const res = createMockRes();

      executeQuery
        .mockResolvedValueOnce({ rows: [{ total: 12 }] })
        .mockResolvedValueOnce({
          rows: [
            {
              resume_id: 'r-1',
              user_id: 7,
              name: 'Alice',
              projects: '[{"name":"Admin Portal"}]',
              skills: '["Vue","TS"]',
              created_at: '2026-04-09T10:00:00.000Z'
            }
          ]
        });

      await getAllResumes(req, res);

      expect(executeQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT COUNT(*) as total FROM resume_records',
        []
      );
      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/SELECT \* FROM resume_records\s+ORDER BY created_at DESC\s+LIMIT \? OFFSET \?/),
        [5, 5]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: {
          list: [
            expect.objectContaining({
              resume_id: 'r-1',
              user_id: 7,
              projects: [{ name: 'Admin Portal' }],
              skills: ['Vue', 'TS']
            })
          ],
          pagination: {
            page: 2,
            pageSize: 5,
            total: 12,
            totalPages: 3
          }
        }
      });
    });

    it('returns empty list when there are no resumes', async () => {
      const req = createMockReq({
        query: { page: '1', pageSize: '10' }
      });
      const res = createMockRes();

      executeQuery
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [] });

      await getAllResumes(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: {
          list: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 0
          }
        }
      });
    });

    it('returns 500 when querying resumes fails', async () => {
      const req = createMockReq({
        query: { page: '1', pageSize: '10' }
      });
      const res = createMockRes();
      executeQuery.mockRejectedValue(new Error('db error'));

      await getAllResumes(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 500, data: null })
      );
    });

    it('sanitizes invalid negative pagination values to defaults', async () => {
      const req = createMockReq({
        query: { page: '-2', pageSize: '-5' }
      });
      const res = createMockRes();

      executeQuery
        .mockResolvedValueOnce({ rows: [{ total: 3 }] })
        .mockResolvedValueOnce({ rows: [] });

      await getAllResumes(req, res);

      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/SELECT \* FROM resume_records\s+ORDER BY created_at DESC\s+LIMIT \? OFFSET \?/),
        [10, 0]
      );
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: {
          list: [],
          pagination: {
            page: 1,
            pageSize: 10,
            total: 3,
            totalPages: 1
          }
        }
      });
    });
  });

  describe('deleteResume', () => {
    it('deletes a resume record when it exists', async () => {
      const req = createMockReq({
        params: { resume_id: 'r-delete' }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rowsAffected: 1 });

      await deleteResume(req, res);

      expect(executeQuery).toHaveBeenCalledWith(
        'DELETE FROM resume_records WHERE resume_id = ?',
        ['r-delete']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: null
      });
    });

    it('returns 404 when the resume record does not exist', async () => {
      const req = createMockReq({
        params: { resume_id: 'missing-resume' }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rowsAffected: 0 });

      await deleteResume(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 404, data: null })
      );
    });

    it('returns 500 when deleting a resume fails', async () => {
      const req = createMockReq({
        params: { resume_id: 'broken-resume' }
      });
      const res = createMockRes();
      executeQuery.mockRejectedValue(new Error('db error'));

      await deleteResume(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 500, data: null })
      );
    });

    it('returns 400 when resume_id is missing', async () => {
      const req = createMockReq({
        params: {}
      });
      const res = createMockRes();

      await deleteResume(req, res);

      expect(executeQuery).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 400, data: null })
      );
    });
  });
});

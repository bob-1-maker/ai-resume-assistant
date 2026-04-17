import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockReq, createMockRes } from '../helpers/httpMocks.js';

const executeQuery = jest.fn();
const executeBatch = jest.fn();

jest.unstable_mockModule('../../config/turso.js', () => ({
  executeQuery,
  executeBatch
}));

const {
  batchSaveResumes,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume
} = await import('../../controllers/resumeController.js');

describe('resumeController', () => {
  beforeEach(() => {
    executeQuery.mockReset();
    executeBatch.mockReset();
  });

  describe('batchSaveResumes', () => {
    it('returns 400 when request body is not an array', async () => {
      const req = createMockReq({ body: {}, userId: 1 });
      const res = createMockRes();

      await batchSaveResumes(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(executeBatch).not.toHaveBeenCalled();
    });

    it('returns 400 when request array is empty', async () => {
      const req = createMockReq({ body: [], userId: 1 });
      const res = createMockRes();

      await batchSaveResumes(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(executeBatch).not.toHaveBeenCalled();
    });

    it('builds batch queries and returns success', async () => {
      const req = createMockReq({
        userId: 7,
        body: [
          {
            resume_id: 'r1',
            name: 'Alice',
            phone: '123',
            email: 'a@example.com',
            education: '本科',
            projects: [{ name: 'AI Resume' }],
            skills: ['Vue']
          }
        ]
      });
      const res = createMockRes();
      executeBatch.mockResolvedValue([{ rowsAffected: 1 }]);

      await batchSaveResumes(req, res);

      expect(executeBatch).toHaveBeenCalledTimes(1);
      expect(executeBatch).toHaveBeenCalledWith([
        expect.objectContaining({
          sql: expect.stringContaining('INSERT OR REPLACE INTO resume_records'),
          params: [
            'r1',
            'Alice',
            '123',
            'a@example.com',
            '本科',
            JSON.stringify([{ name: 'AI Resume' }]),
            JSON.stringify(['Vue']),
            7,
            'r1'
          ]
        })
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: { count: 1 }
      });
    });
  });

  describe('getResumes', () => {
    it('returns paginated resume records with parsed JSON fields', async () => {
      const req = createMockReq({
        userId: 3,
        query: { page: '2', pageSize: '5' }
      });
      const res = createMockRes();

      executeQuery
        .mockResolvedValueOnce({ rows: [{ total: 11 }] })
        .mockResolvedValueOnce({
          rows: [
            {
              resume_id: 'r2',
              projects: '[{"name":"Demo"}]',
              skills: '["Node"]',
              created_at: '2026-04-09T10:00:00.000Z'
            }
          ]
        });

      await getResumes(req, res);

      expect(executeQuery).toHaveBeenNthCalledWith(
        1,
        'SELECT COUNT(*) as total FROM resume_records WHERE user_id = ?',
        [3]
      );
      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        'SELECT * FROM resume_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [3, 5, 5]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: {
          list: [
            expect.objectContaining({
              resume_id: 'r2',
              projects: [{ name: 'Demo' }],
              skills: ['Node'],
              created_at: expect.any(String)
            })
          ],
          pagination: {
            page: 2,
            pageSize: 5,
            total: 11,
            totalPages: 3
          }
        }
      });
    });
  });

  describe('getResumeById', () => {
    it('returns 404 when resume record is missing', async () => {
      const req = createMockReq({
        userId: 2,
        params: { resume_id: 'missing' }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rows: [] });

      await getResumeById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns a parsed resume record when it exists', async () => {
      const req = createMockReq({
        userId: 2,
        params: { resume_id: 'r3' }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({
        rows: [
          {
            resume_id: 'r3',
            projects: '[{"name":"Project X"}]',
            skills: '["Vue","TS"]'
          }
        ]
      });

      await getResumeById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: {
          resume_id: 'r3',
          projects: [{ name: 'Project X' }],
          skills: ['Vue', 'TS']
        }
      });
    });
  });

  describe('updateResume', () => {
    it('returns 404 when no record is updated', async () => {
      const req = createMockReq({
        userId: 4,
        params: { resume_id: 'r4' },
        body: { name: 'Updated' }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rowsAffected: 0 });

      await updateResume(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('updates a resume record and returns 200', async () => {
      const req = createMockReq({
        userId: 4,
        params: { resume_id: 'r4' },
        body: {
          name: 'Updated',
          phone: '111',
          email: 'u@example.com',
          education: '硕士',
          projects: [{ name: 'Project Y' }],
          skills: ['Jest']
        }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rowsAffected: 1 });

      await updateResume(req, res);

      expect(executeQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE resume_records SET'),
        [
          'Updated',
          '111',
          'u@example.com',
          '硕士',
          JSON.stringify([{ name: 'Project Y' }]),
          JSON.stringify(['Jest']),
          'r4',
          4
        ]
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteResume', () => {
    it('returns 404 when no record is deleted', async () => {
      const req = createMockReq({
        userId: 4,
        params: { resume_id: 'r4' }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rowsAffected: 0 });

      await deleteResume(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deletes a record and returns 200', async () => {
      const req = createMockReq({
        userId: 4,
        params: { resume_id: 'r4' }
      });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rowsAffected: 1 });

      await deleteResume(req, res);

      expect(executeQuery).toHaveBeenCalledWith(
        'DELETE FROM resume_records WHERE resume_id = ? AND user_id = ?',
        ['r4', 4]
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockReq, createMockRes } from '../helpers/httpMocks.js';

const executeQuery = jest.fn();
const hash = jest.fn();
const compare = jest.fn();
const sign = jest.fn();

jest.unstable_mockModule('../../config/turso.js', () => ({
  executeQuery
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash,
    compare
  }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign
  }
}));

const {
  register,
  login,
  getCurrentUser
} = await import('../../controllers/userController.js');

describe('userController', () => {
  beforeEach(() => {
    executeQuery.mockReset();
    hash.mockReset();
    compare.mockReset();
    sign.mockReset();
  });

  describe('register', () => {
    it('returns 400 when username or password is missing', async () => {
      const req = createMockReq({ body: { username: '', password: '' } });
      const res = createMockRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 400, data: null })
      );
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it('returns 400 when username already exists', async () => {
      const req = createMockReq({ body: { username: 'alice', password: 'secret' } });
      const res = createMockRes();
      executeQuery.mockResolvedValueOnce({ rows: [{ id: 1, username: 'alice' }] });

      await register(req, res);

      expect(executeQuery).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['alice']
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 400, data: null })
      );
    });

    it('creates a user when input is valid', async () => {
      const req = createMockReq({ body: { username: 'alice', password: 'secret' } });
      const res = createMockRes();

      executeQuery
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rowsAffected: 1 });
      hash.mockResolvedValue('hashed-secret');

      await register(req, res);

      expect(hash).toHaveBeenCalledWith('secret', 10);
      expect(executeQuery).toHaveBeenNthCalledWith(
        2,
        'INSERT INTO users (username, password) VALUES (?, ?)',
        ['alice', 'hashed-secret']
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 200, data: null })
      );
    });

    it('returns 500 when database access fails', async () => {
      const req = createMockReq({ body: { username: 'alice', password: 'secret' } });
      const res = createMockRes();
      executeQuery.mockRejectedValue(new Error('db error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 500, data: null })
      );
    });
  });

  describe('login', () => {
    it('returns 400 when username or password is missing', async () => {
      const req = createMockReq({ body: { username: '', password: '' } });
      const res = createMockRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(executeQuery).not.toHaveBeenCalled();
    });

    it('returns 401 when the user does not exist', async () => {
      const req = createMockReq({ body: { username: 'alice', password: 'secret' } });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rows: [] });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(compare).not.toHaveBeenCalled();
    });

    it('returns 401 when password validation fails', async () => {
      const req = createMockReq({ body: { username: 'alice', password: 'bad' } });
      const res = createMockRes();
      executeQuery.mockResolvedValue({
        rows: [{ id: 1, username: 'alice', password: 'hashed-secret' }]
      });
      compare.mockResolvedValue(false);

      await login(req, res);

      expect(compare).toHaveBeenCalledWith('bad', 'hashed-secret');
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns token and user data when login succeeds', async () => {
      const req = createMockReq({ body: { username: 'alice', password: 'secret' } });
      const res = createMockRes();
      executeQuery.mockResolvedValue({
        rows: [{ id: 1, username: 'alice', password: 'hashed-secret' }]
      });
      compare.mockResolvedValue(true);
      sign.mockReturnValue('signed-token');

      await login(req, res);

      expect(sign).toHaveBeenCalledWith(
        { userId: 1, username: 'alice' },
        expect.any(String),
        { expiresIn: '7d' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: {
          token: 'signed-token',
          user: {
            id: 1,
            username: 'alice'
          }
        }
      });
    });
  });

  describe('getCurrentUser', () => {
    it('returns 404 when the user is missing', async () => {
      const req = createMockReq({ userId: 10 });
      const res = createMockRes();
      executeQuery.mockResolvedValue({ rows: [] });

      await getCurrentUser(req, res);

      expect(executeQuery).toHaveBeenCalledWith(
        'SELECT id, username, created_at FROM users WHERE id = ?',
        [10]
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('returns current user data when user exists', async () => {
      const req = createMockReq({ userId: 10 });
      const res = createMockRes();
      const user = {
        id: 10,
        username: 'alice',
        created_at: '2026-04-09 10:00:00'
      };
      executeQuery.mockResolvedValue({ rows: [user] });

      await getCurrentUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        msg: expect.any(String),
        data: user
      });
    });
  });
});

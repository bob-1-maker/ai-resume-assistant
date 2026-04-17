import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockReq, createMockRes } from '../helpers/httpMocks.js';

const verify = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify
  }
}));

const { verifyToken } = await import('../../middleware/auth.js');

describe('verifyToken middleware', () => {
  beforeEach(() => {
    verify.mockReset();
  });

  it('returns 401 when authorization header is missing', () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header format is invalid', () => {
    const req = createMockReq({
      headers: { authorization: 'Token abc123' }
    });
    const res = createMockRes();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(verify).not.toHaveBeenCalled();
  });

  it('returns 401 when jwt verification fails', () => {
    const req = createMockReq({
      headers: { authorization: 'Bearer bad-token' }
    });
    const res = createMockRes();
    const next = jest.fn();
    verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    verifyToken(req, res, next);

    expect(verify).toHaveBeenCalledWith('bad-token', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches user info and calls next when token is valid', () => {
    const req = createMockReq({
      headers: { authorization: 'Bearer good-token' }
    });
    const res = createMockRes();
    const next = jest.fn();
    verify.mockReturnValue({ userId: 8, username: 'alice' });

    verifyToken(req, res, next);

    expect(req.userId).toBe(8);
    expect(req.username).toBe('alice');
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createMockReq, createMockRes } from '../helpers/httpMocks.js';

const verify = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify
  }
}));

const { verifyAdminToken } = await import('../../middleware/adminAuth.js');

describe('verifyAdminToken middleware', () => {
  beforeEach(() => {
    verify.mockReset();
  });

  it('returns 401 when authorization header is missing', () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();
    const next = jest.fn();

    verifyAdminToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when authorization header format is invalid', () => {
    const req = createMockReq({
      headers: { authorization: 'Token admin-token' }
    });
    const res = createMockRes();
    const next = jest.fn();

    verifyAdminToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(verify).not.toHaveBeenCalled();
  });

  it('returns 401 when bearer token value is empty', () => {
    const req = createMockReq({
      headers: { authorization: 'Bearer ' }
    });
    const res = createMockRes();
    const next = jest.fn();

    verifyAdminToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when token is valid but user is not admin', () => {
    const req = createMockReq({
      headers: { authorization: 'Bearer user-token' }
    });
    const res = createMockRes();
    const next = jest.fn();

    verify.mockReturnValue({ userId: 8, username: 'alice', isAdmin: false });

    verifyAdminToken(req, res, next);

    expect(verify).toHaveBeenCalledWith('user-token', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
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

    verifyAdminToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches admin info and calls next when admin token is valid', () => {
    const req = createMockReq({
      headers: { authorization: 'Bearer admin-token' }
    });
    const res = createMockRes();
    const next = jest.fn();

    verify.mockReturnValue({ username: 'admin', isAdmin: true });

    verifyAdminToken(req, res, next);

    expect(req.admin).toEqual({
      username: 'admin',
      isAdmin: true
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

import jwt, { Jwt, NotBeforeError } from 'jsonwebtoken';
import { Result } from '@/common/core/Result';
import { auth } from '@/common/middlewares/auth';
import { NextFunction, Request, Response, response } from 'express';
import { HttpCode } from '@/common/exceptions/appError';

jest.mock('jsonwebtoken');

describe('Auth Middleware Test', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  test('it should throw 401 error with no auth headers', () => {
    auth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith(
      Result.fail('Unauthorized User')
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('it should call next function with valid auth token', () => {
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    const verifySpy = jest.spyOn(jwt, 'verify');
    verifySpy.mockImplementation((token, secret, options, callback) => {
      const decoded = { id: 'user_id' };
      callback(null, decoded);
    });

    auth(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
    verifySpy.mockRestore();
  });

  test('it should throw Jwt Expired error with expired token', () => {
    mockRequest.headers = { authorization: 'Bearer expired_token' };
    const verifySpy = jest.spyOn(jwt, 'verify');
    verifySpy.mockImplementation((token, secret, options, callback) => {
      return callback(new Error('jwt expired') as jwt.JsonWebTokenError, null);
    });

    auth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      Result.fail('Access Token expired.')
    );
    expect(nextFunction).not.toHaveBeenCalled();

    verifySpy.mockRestore();
  });

  test('it should throw error with invalid auth token', () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    const verifySpy = jest.spyOn(jwt, 'verify');
    verifySpy.mockImplementation((token, secret, options, callback) => {
      return callback(
        new Error('invalid token') as jwt.JsonWebTokenError,
        null
      );
    });

    auth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpCode.INTERNAL_SERVER_ERROR
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      Result.fail('invalid token')
    );
    expect(nextFunction).not.toHaveBeenCalled();

    verifySpy.mockRestore();
  });
});

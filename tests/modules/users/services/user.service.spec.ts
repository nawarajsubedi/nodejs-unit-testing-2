import { userSignup, userSignin } from '@modules/users/services/user.service';
import * as UserRepositiory from '@modules/users/repository/user.repository';
import { AppError } from '@common/exceptions/appError';
import * as Mappers from '@modules/users/mappers/userResponseMapper';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUsers } from '@/modules/users/services/user.service';
import { User } from '@prisma/client';

afterEach(() => {
  sinon.restore();
});

describe('userSignup', () => {
  const email = 'test@example.com';
  const password = 'testPassword';
  const hashedPassword = 'hashedPassword';

  const payload = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email,
    phoneNumber: '123-456-7890',
    address: '123 Main St, Anytown USA',
    isActive: true,
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } as User;

  test('it should throw an error if user already exists', async () => {
    const existingUserFun = sinon
      .stub(UserRepositiory, 'getExistingUser')
      .resolves(payload);
    expect(userSignup(payload)).rejects.toThrowError(AppError);

    sinon.assert.calledOnceWithExactly(existingUserFun, email);
  });

  test('it should return new created user with hashedPassword', async () => {
    sinon.stub(UserRepositiory, 'getExistingUser').resolves(null);

    sinon.stub(bcrypt, 'hash').resolves(hashedPassword);
    sinon.stub(UserRepositiory, 'createUser').resolves(payload);

    const bcryptHashPassword = await bcrypt.hash(password, 10);
    const result = await userSignup(payload);
    expect(result).toEqual(payload);
    expect(bcryptHashPassword).toEqual(hashedPassword);
  });

  test('it should throw error if creating user fails', async () => {
    sinon.stub(UserRepositiory, 'getExistingUser').resolves(null);
    sinon.stub(bcrypt, 'hash').resolves(hashedPassword);
    sinon.stub(UserRepositiory, 'createUser').resolves(null);

    expect(userSignup(payload)).rejects.toThrowError(AppError);
  });

  test('it should not have "password" field in the returned data', async () => {
    sinon.stub(UserRepositiory, 'getExistingUser').resolves(null);
    sinon.stub(bcrypt, 'hash').resolves(hashedPassword);
    sinon.stub(UserRepositiory, 'createUser').resolves(payload);
    const result = await userSignup(payload);
    expect(result).toEqual(
      expect.not.objectContaining({ password: expect.anything() })
    );
  });
});

describe('userSignin', () => {
  const email = 'test@example.com';
  const password = 'testPassword';
  const payload = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email,
    password,
    phoneNumber: '123-456-7890',
    address: '123 Main St, Anytown USA'
  } as User;

  test('it should throw an error if user with given email does not exist', async () => {
    sinon.stub(UserRepositiory, 'getExistingUser').resolves(null);
    expect(userSignin(payload)).rejects.toThrowError(AppError);
  });

  test('it should throw error if password and email does not match', async () => {
    sinon.stub(UserRepositiory, 'getExistingUser').resolves(payload);
    sinon.stub(bcrypt, 'compare').resolves(false);
    expect(userSignin(payload)).rejects.toThrowError(AppError);
  });

  test('it should generate accessToken and refreshToken', async () => {
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';

    sinon.stub(UserRepositiory, 'getExistingUser').resolves(payload);
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon
      .stub(jwt, 'sign')
      .onFirstCall()
      .callsFake(() => accessToken)
      .onSecondCall()
      .callsFake(() => refreshToken);
    const result = await userSignin(payload);
    const expectedResult = {
      accessToken,
      refreshToken,
      id: payload.id,
      name: `${payload.firstName} ${payload.lastName}`
    };
    expect(result).toEqual(expectedResult);
  });

  test('it should return object containing id, name and tokens', async () => {
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';

    sinon.stub(UserRepositiory, 'getExistingUser').resolves(payload);
    sinon.stub(bcrypt, 'compare').resolves(true);
    sinon
      .stub(jwt, 'sign')
      .onFirstCall()
      .callsFake(() => accessToken)
      .onSecondCall()
      .callsFake(() => refreshToken);
    const result = await userSignin(payload);
    const expectedResult = {
      accessToken,
      refreshToken,
      id: payload.id,
      name: `${payload.firstName} ${payload.lastName}`
    };
    expect(result).toEqual(expectedResult);
  });
});

describe('getUsers', () => {
  const email = 'test@example.com';
  const password = 'testPassword';
  const expectedData = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email,
      phoneNumber: '123-456-7890',
      address: '123 Main St, Anytown USA',
      isActive: true,
      isVerified: true,
      createdAt: '2023-04-06T11:23:45.276Z',
      updatedAt: '2023-04-06T11:23:45.276Z'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Emilie',
      email,
      phoneNumber: '523-456-110',
      address: '77 Gol Mont, Townany Nepal',
      isActive: true,
      isVerified: false,
      createdAt: '2023-04-06T11:23:45.276Z',
      updatedAt: '2023-04-06T11:23:45.276Z'
    }
  ];
  const users = [
    { ...expectedData[0], password },
    { ...expectedData[1], password }
  ] as unknown as User[];

  test('it should throw an error if fetchUser fails', async () => {
    sinon.stub(UserRepositiory, 'fetchUser').resolves(null);
    expect(getUsers()).rejects.toThrowError(AppError);
  });

  test('it should map users data proper response data', async () => {
    sinon.stub(UserRepositiory, 'fetchUser').resolves(users);
    const result = await getUsers();
    expect(result).toEqual(users.map(Mappers.mapUserToUserResponse));
  });

  test('it should return mapped user data without password', async () => {
    sinon.stub(UserRepositiory, 'fetchUser').resolves(users);
    const result = await getUsers();
    expect(result).toEqual(
      expectedData.map((user) => ({
        ...user,
        password: undefined
      }))
    );
  });
});

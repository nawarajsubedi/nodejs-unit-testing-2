// import sinon from 'sinon';
import * as Mappers from '@modules/users/mappers/userResponseMapper';
import { User } from '@prisma/client';

describe('mapUserToUserResponse', () => {
  test('it should map a user to a user response', () => {
    const mockUserData = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '123-456-7890',
      address: '123 Main St, Anytown USA',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
    const userResponse = Mappers.mapUserToUserResponse(mockUserData);
    expect(userResponse).toEqual({
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '123-456-7890',
      address: '123 Main St, Anytown USA',
      isActive: true,
      isVerified: true,
      createdAt: mockUserData.createdAt,
      updatedAt: mockUserData.updatedAt
    });
  });
});

describe('userLoginResponse', () => {
  test('it should return a LoginResponse object with the correct properties', () => {
    const mockUserData = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '123-456-7890',
      address: '123 Main St, Anytown USA',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    const accessToken = 'token';
    const refreshToken = 'refresh';

    const loginResponse = Mappers.userLoginResponse(
      mockUserData,
      accessToken,
      refreshToken
    );
    expect(loginResponse.accessToken).toBe(accessToken);
    expect(loginResponse.refreshToken).toBe(refreshToken);
    expect(loginResponse.id).toBe(mockUserData.id);
    expect(loginResponse.name).toBe(
      `${mockUserData.firstName} ${mockUserData.lastName}`
    );
  });
});

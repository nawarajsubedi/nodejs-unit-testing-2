import {
  createUser,
  fetchUser,
  getExistingUser
} from '@/modules/users/repository/user.repository';
import { User } from '@prisma/client';
import { prismaMock } from '@tests/prismaTestSetup';

const mockDataStore = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    address: '123 Main St, Anytown USA',
    isActive: true,
    isVerified: true,
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-05')
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '987-654-3210',
    address: '456 Oak St, Anytown USA',
    isActive: false,
    isVerified: true,
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-05')
  }
] as User[];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createUser function', () => {
  const mockUserData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    address: '123 Main St, Anytown USA',
    isActive: true,
    isVerified: true,
    password: 'password123'
  } as User;

  //@ts-ignore
  const mockCreate = prismaMock.user.create;

  test('it should return new user object with the correct arguments', async () => {
    mockCreate.mockResolvedValue(mockUserData);
    const user = await createUser(mockUserData);
    expect(mockCreate).toHaveBeenCalledWith({ data: mockUserData });
    expect(user).toEqual(mockUserData);
  });

  test('it should throw an error if user creation fails', async () => {
    mockCreate.mockRejectedValue(new Error('Failed to create a user'));
    expect(createUser(mockUserData)).rejects.toThrowError(
      'Failed to create a user'
    );
  });
});

describe('fetchUser function', () => {
  const mockFindMany = prismaMock.user.findMany;

  test('it should return the users list', async () => {
    mockFindMany.mockResolvedValue(mockDataStore);
    const users = await fetchUser();
    expect(users).toEqual(mockDataStore);
  });

  test('it should throw an error if users list could not be fetched', async () => {
    mockFindMany.mockRejectedValue(
      new Error('Users list could not be fetched')
    );

    expect(fetchUser()).rejects.toThrowError('Users list could not be fetched');
  });
});

describe('getExistingUser function', () => {
  const mockFindUnique = prismaMock.user.findUnique;

  test('it should return the existing user data with the given email', async () => {
    const mockUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '123-456-7890',
      address: '123 Main St, Anytown USA',
      isActive: true,
      isVerified: true
    } as User;
    mockFindUnique.mockResolvedValue(mockUserData);
    const user = await getExistingUser(mockUserData.email);
    expect(user).toEqual(mockUserData);
  });

  test('it should return null if user with given email is not found', async () => {
    const email = 'test@gmail.com';
    mockFindUnique.mockResolvedValue(null);
    const user = await getExistingUser(email);
    expect(user).toBeNull();
  });

  test('it should throw an error if fetching user fails', async () => {
    const email = 'test@gmail.com';
    mockFindUnique.mockRejectedValue(new Error('User could not be fetched'));

    expect(getExistingUser(email)).rejects.toThrowError(
      'User could not be fetched'
    );
  });
});

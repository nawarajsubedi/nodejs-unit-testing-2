import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '@config/client';

// jest.mock('@config/client', () => ({
// }));

// beforeEach(() => {
// });

// export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

jest.mock('@config/client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>() // Mocking the PrismaClient object
}));

beforeEach(() => {
  mockReset(prisma); // Resetting the mock before each test
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

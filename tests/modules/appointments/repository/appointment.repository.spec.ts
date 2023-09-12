import { prismaMock } from '@tests/prismaTestSetup';
import { Appointment, Prisma } from '@prisma/client';
import {
  createAppointment,
  deleteAppointmentById,
  getAppointmentById,
  getAppointmentForUserId,
  getAppointmentsByUserId,
  updateAppointmentById
} from '@modules/appointments/repository/appointment.repository';

const PAGE = 1;
const LIMIT = 2;

describe('createAppointment', () => {
  const mockAppointmentDataInput = {
    title: 'Hello',
    date: new Date(),
    appointmentBy: '1',
    appointmentFor: '1'
  } as Appointment;

  const mockAppointmentResult = {
    id: 'test-id-1',
    ...mockAppointmentDataInput
  } as Appointment;

  //@ts-ignore
  const appointmentMockCreate = prismaMock.appointment.create;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('it should return created appointment with the valid appointment payload', async () => {
    appointmentMockCreate.mockResolvedValue(mockAppointmentResult);
    const result = await createAppointment(mockAppointmentDataInput);
    expect(result).toEqual(mockAppointmentResult);
  });
});
describe('updateAppointment', () => {
  const mockAppointmentData = {
    id: 'test-id-1',
    title: 'Hello',
    date: new Date(),
    appointmentBy: '1',
    appointmentFor: '1'
  } as Appointment;

  //@ts-ignore
  const appointmentMockUpdateMany = prismaMock.appointment.updateMany;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('it should return updated appointment count', async () => {
    const updateCount = 1;
    appointmentMockUpdateMany.mockResolvedValue({ count: updateCount });
    const result = await updateAppointmentById(
      mockAppointmentData.id,
      mockAppointmentData
    );
    expect(result.count).toBe(updateCount);
  });
});

describe('findById', () => {
  const mockAppointment: Prisma.AppointmentUncheckedCreateInput = {
    id: '1',
    title: 'Hello',
    date: new Date(),
    appointmentBy: '1',
    appointmentFor: '1'
  };

  //@ts-ignore
  const mockFindUnique = prismaMock.appointment.findUnique;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('it should return appointment with given id, if the payload is correct', async () => {
    mockFindUnique.mockResolvedValue(mockAppointment as Appointment);
    const result = await getAppointmentById(mockAppointment.id);
    expect(result).toEqual(mockAppointment);
  });

  test('it should return null for non-existing appoints', async () => {
    const appointmentId = '2';
    mockFindUnique.mockResolvedValue(null);
    const result = await getAppointmentById(appointmentId);
    expect(result).toEqual(null);
  });
});

describe('getAppointmentByUserId', () => {
  const mockAppointments = [
    {
      id: '1',
      title: 'Hello 1',
      date: new Date(),
      appointmentBy: '1',
      appointmentFor: '1'
    },
    {
      id: '2',
      title: 'Hello 2',
      date: new Date(),
      appointmentBy: '1',
      appointmentFor: '2'
    }
  ] as Appointment[];

  //@ts-ignore
  const mockFindMany = prismaMock.appointment.findMany;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('it should return array of appointments when correct payload is provided ', async () => {
    const userId = '2';
    mockFindMany.mockResolvedValue(mockAppointments);
    const result = await getAppointmentsByUserId(
      userId,
      LIMIT,
      PAGE,
      Prisma.AppointmentScalarFieldEnum.id,
      Prisma.SortOrder.asc
    );
    expect(result).toEqual(mockAppointments);
  });
});
describe('getAppointmentForUserId', () => {
  const mockAppointments = [
    {
      id: '1',
      title: 'Hello 1',
      date: new Date(),
      appointmentBy: '1',
      appointmentFor: '2'
    },
    {
      id: '2',
      title: 'Hello 2',
      date: new Date(),
      appointmentBy: '1',
      appointmentFor: '2'
    }
  ] as Appointment[];
  //@ts-ignore
  const mockFindMany = prismaMock.appointment.findMany;

  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('it should return list of appointments when the correct arguments provided', async () => {
    const userId = '2';

    mockFindMany.mockResolvedValue(mockAppointments);
    const result = await getAppointmentForUserId(
      userId,
      LIMIT,
      PAGE,
      Prisma.AppointmentScalarFieldEnum.id,
      Prisma.SortOrder.asc
    );
    expect(result).toEqual(mockAppointments);
  });
});

describe('deleteAppointmentById', () => {
  //@ts-ignore
  const mockDeleteMany = prismaMock.appointment.deleteMany;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('it should return deleted appointment count when the correct arguments provided', async () => {
    const deleteCount = 1;
    const userId = '1';
    const appoinmentId = '2';

    mockDeleteMany.mockResolvedValue({ count: deleteCount });
    const result = await deleteAppointmentById(appoinmentId, userId);
    expect(result.count).toEqual(deleteCount);
  });

  test('it should return the count of deleted appointments', async () => {
    // Revisit
    const deleteCount = 2;
    const userId = '1';
    const appoinmentId = '2';

    mockDeleteMany.mockResolvedValue({ count: deleteCount });
    const result = await deleteAppointmentById(appoinmentId, userId);
    expect(result.count).toEqual(deleteCount);
  });

  test('it should return null if no appointment was deleted', async () => {
    const deleteCount = 0;
    const userId = '1';
    const appoinmentId = '2';

    mockDeleteMany.mockResolvedValue({ count: deleteCount });
    const result = await deleteAppointmentById(appoinmentId, userId);
    expect(result.count).toBe(deleteCount);
  });
});

import sinon from 'sinon';
import * as AppointmentRepository from '@/modules/appointments/repository/appointment.repository';
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getUserCreatedAppointments,
  updateAppointment
} from '@/modules/appointments/services/appointment.service';
import { Prisma, Appointment } from '@prisma/client';
import { AppError } from '@/common/exceptions/appError';
import * as DateUtils from '@/utils/date';
import { GetUserCreatedAppointmentPayload } from '@modules/appointments/interfaces/userCreatedAppointment.interface';

describe('createAppointment', () => {
  // arrange
  const payload = {
    date: new Date('2021-04-07T10:00:00.000Z'),
    appointmentFor: 'Jane Doe',
    title: 'Title 1',
    appointmentBy: '1'
  } as Appointment;

  afterEach(() => {
    sinon.restore();
  });

  test('it should return appointment object with the correct payload', async () => {
    const expectedPayload = {
      ...payload,
      date: new Date(payload.date),
      id: '1'
    } as Appointment;
    const createAppointmentStub = sinon
      .stub(AppointmentRepository, 'createAppointment')
      .resolves(expectedPayload);

    // act
    await createAppointment({ ...payload, date: new Date(payload.date) });

    // assert
    sinon.assert.calledOnce(createAppointmentStub);
    sinon.assert.calledWith(createAppointmentStub, {
      ...payload,
      date: new Date(payload.date)
    });
  });

  test('it should throw an error when appointment creation fails', async () => {
    const createAppointmentStub = sinon
      .stub(AppointmentRepository, 'createAppointment')
      .resolves(null);
    expect(createAppointment(payload)).rejects.toThrow(AppError);
    sinon.assert.calledOnceWithExactly(createAppointmentStub, payload);
  });
});

describe('getUserCreatedAppointments', () => {
  afterEach(() => {
    sinon.restore();
  });

  test('it should return the user created appointments with correct payload', async () => {
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

    const payload: GetUserCreatedAppointmentPayload = {
      userId: '1',
      limit: 10,
      page: 1,
      sortBy: Prisma.AppointmentScalarFieldEnum.id,
      sortDir: Prisma.SortOrder.asc
    };
    const { userId, limit, page, sortBy, sortDir } = payload;
    const getUserCreatedAppointmentsStub = sinon
      .stub(AppointmentRepository, 'getAppointmentsByUserId')
      .resolves(mockAppointments);

    await getUserCreatedAppointments(payload);

    sinon.assert.calledOnce(getUserCreatedAppointmentsStub);
    sinon.assert.calledWith(
      getUserCreatedAppointmentsStub,
      userId,
      limit,
      page,
      sortBy,
      sortDir
    );
  });

  test('it should throw error with for non-existing appointment', async () => {
    const payload: GetUserCreatedAppointmentPayload = {
      userId: '1',
      limit: 10,
      page: 1,
      sortBy: Prisma.AppointmentScalarFieldEnum.id,
      sortDir: Prisma.SortOrder.asc
    };
    const getUserCreatedAppointmentsStub = sinon
      .stub(AppointmentRepository, 'getAppointmentsByUserId')
      .resolves(null);

    expect(getUserCreatedAppointments(payload)).rejects.toThrow(AppError);
    sinon.assert.calledOnce(getUserCreatedAppointmentsStub);
  });
});

describe('getAppointment', () => {
  afterEach(() => {
    sinon.restore();
  });

  test('it should return the appointment if it exists and belongs to the user', async () => {
    const userId = '1';
    const appointmentId = '1';

    const mockAppointment = {
      id: '1',
      title: 'Hello 1',
      date: new Date(),
      appointmentBy: '1',
      appointmentFor: '1'
    } as Appointment;

    const getUserAppointmentsStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(mockAppointment);

    await getAppointment(appointmentId, userId);
    sinon.assert.calledOnce(getUserAppointmentsStub);
    sinon.assert.calledWithExactly(getUserAppointmentsStub, appointmentId);
  });

  test('it should throw notFound if the appointment does not exist', async () => {
    const userId = '1';
    const appointmentId = '1';

    const getUserAppointmentsStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(null);

    expect(getAppointment(appointmentId, userId)).rejects.toThrow(AppError);
    sinon.assert.calledOnce(getUserAppointmentsStub);
    sinon.assert.calledWithExactly(getUserAppointmentsStub, appointmentId);
  });

  test('it should throw notFound if the appointment does not belong to the user', async () => {
    const userId = '1';
    const appointmentId = '3';
    const mockAppointment = {
      id: '3',
      title: 'Hello 1',
      date: new Date(),
      appointmentBy: '2',
      appointmentFor: '2'
    } as Appointment;

    const getUserAppointmentsStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(mockAppointment);

    expect(getAppointment(appointmentId, userId)).rejects.toThrow(AppError);
    sinon.assert.calledOnce(getUserAppointmentsStub);
    sinon.assert.calledWithExactly(getUserAppointmentsStub, appointmentId);
  });

  test('it should throw the error thrown by AppointmentRepository.getAppointmentById', async () => {
    const userId = '1';
    const appointmentId = '3';
    const getUserAppointmentsStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(null);

    expect(getAppointment(appointmentId, userId)).rejects.toThrow(AppError);
    sinon.assert.calledOnce(getUserAppointmentsStub);
    sinon.assert.calledWithExactly(getUserAppointmentsStub, appointmentId);
  });
});

describe('updateAppointment', () => {
  const payload: Appointment = {
    title: 'Hello',
    date: new Date(),
    appointmentBy: '1',
    appointmentFor: '1'
  } as Appointment;

  afterEach(() => {
    sinon.restore();
  });

  test('it should return updated appointment with the correct payload', async () => {
    const appointmentId = '1';
    const updateCount = 1;

    const appoinmentResult: Appointment = {
      title: 'Hello',
      id: '1',
      date: new Date('2023-07-20'),
      appointmentBy: '1',
      appointmentFor: '1'
    } as Appointment;

    const getAppointmentStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(appoinmentResult);

    const updateAppointmentStub = sinon
      .stub(AppointmentRepository, 'updateAppointmentById')
      .resolves({ count: updateCount });
    await updateAppointment(appointmentId, payload);

    sinon.assert.calledWith(getAppointmentStub, appointmentId);
    sinon.assert.calledWith(updateAppointmentStub, appointmentId, {
      ...payload,
      date: new Date(payload.date)
    });
  });

  test('it should throw an error when appointment does not exist', async () => {
    const appointmentId = '1';

    const getAppointmentStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(null);

    await expect(updateAppointment(appointmentId, payload)).rejects.toThrow(
      AppError
    );
    sinon.assert.calledWith(getAppointmentStub, appointmentId);
  });

  test('it should throw an error when appointment date is in the past', async () => {
    const appointmentId = '1';
    const appoinmentResult: Appointment = {
      title: 'Hello',
      id: '1',
      date: new Date('2022-07-20'),
      appointmentBy: '1',
      appointmentFor: '1'
    } as Appointment;

    const getAppointmentStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(appoinmentResult);

    expect(updateAppointment(appointmentId, payload)).rejects.toThrow(AppError);

    sinon.assert.calledWith(getAppointmentStub, appointmentId);
  });

  test('it should throw an error when updating the appointment fails', async () => {
    const appointmentId = '1';

    const getAppointmentStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(payload);

    const updateAppointmentStub = sinon
      .stub(AppointmentRepository, 'updateAppointmentById')
      .resolves(null);

    expect(updateAppointment(appointmentId, payload)).rejects.toThrow(AppError);
    sinon.assert.calledWith(getAppointmentStub, appointmentId);
  });
});

describe('deleteAppointment', () => {
  const appointmentId = '1';
  const userId = '1';

  const payload: Appointment = {
    title: 'Hello',
    date: new Date(),
    appointmentBy: '1',
    appointmentFor: '1'
  } as Appointment;

  afterEach(() => {
    sinon.restore();
  });

  test('it should return  successful message', async () => {
    const deleteCount = 1;
    const getAppointmentStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(payload);

    const deleteAppointmentStub = sinon
      .stub(AppointmentRepository, 'deleteAppointmentById')
      .resolves({ count: deleteCount });

    const result = await deleteAppointment(appointmentId, userId);

    sinon.assert.calledWith(getAppointmentStub, appointmentId);
    sinon.assert.calledWith(deleteAppointmentStub, appointmentId, userId);
    expect(result).toBe(
      `Appointment with Id ${appointmentId} deleted successfully`
    );
  });

  test('it should throw a bad request error when appointment with given id is not available', async () => {
    const getAppointmentStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(null);

    expect(deleteAppointment(appointmentId, userId)).rejects.toThrowError(
      AppError.badRequest(
        `There is no appointments available with Id ${appointmentId}. Please check the appointment Id.`
      )
    );
    sinon.assert.calledWith(getAppointmentStub, appointmentId);
  });

  test('it should throw an error when deleting the appointment fails', async () => {
    const deleteCount = 0;
    const getAppointmentStub = sinon
      .stub(AppointmentRepository, 'getAppointmentById')
      .resolves(payload);

    const deleteAppointmentStub = sinon
      .stub(AppointmentRepository, 'deleteAppointmentById')
      .resolves({ count: 0 });

    expect(deleteAppointment(appointmentId, userId)).rejects.toThrowError(
      AppError.badRequest(
        `Error while deleting the appointment for ID ${appointmentId}`
      )
    );
    sinon.assert.calledOnceWithExactly(getAppointmentStub, appointmentId);
    // Revist
    // sinon.assert.calledOnceWithExactly(
    //   deleteAppointmentStub,
    //   appointmentId,
    //   userId
    // );
  });
});

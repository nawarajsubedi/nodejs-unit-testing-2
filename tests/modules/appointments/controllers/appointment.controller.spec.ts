import { Response, NextFunction, Request } from 'express';
import sinon, { SinonSpy, SinonStub } from 'sinon';
import * as appointmentService from '@/modules/appointments/services/appointment.service';
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  getUserCreatedAppointments,
  updateAppointment
} from '@/modules/appointments/controllers/appointment.controller';
import { HttpCode } from '@/common/exceptions/appError';
import { RequestWithUser } from '@/common/interfaces/express.interface';
import { Result } from '@/common/core/Result';
import { Appointment } from '@prisma/client';

describe('getUserCreatedAppointments', () => {
  let appointmentServiceStub: sinon.SinonStub;
  let reqWithUser: RequestWithUser;
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let statusSpy: SinonSpy<[code: number], Response>;

  beforeEach(() => {
    appointmentServiceStub = sinon.stub(
      appointmentService,
      'getUserCreatedAppointments'
    );
    reqWithUser = {
      user: { id: 'test_user_id' }
    } as unknown as RequestWithUser;
    req = {} as Request;

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    } as unknown as Response;
    statusSpy = res.status as SinonSpy<[code: number], Response>;
    // });

    next = sinon.stub().returns(undefined);
  });

  afterEach(() => {
    sinon.restore();
  });

  test('it should return user created appointments successfully', async () => {
    const title1 = 'title 1';
    const title2 = 'title 2';
    const appointments: Appointment[] = [
      {
        id: '1',
        title: title1
      },
      {
        id: '2',
        title: title2
      }
    ] as Appointment[];
    appointmentServiceStub.resolves(appointments);
    await getUserCreatedAppointments(reqWithUser, res, next);

    sinon.assert.calledOnceWithExactly(appointmentServiceStub, {
      userId: reqWithUser.user.id,
      ...req.query
    });
  });
});

describe('createAppointment', () => {
  let req: Request;
  let reqWithUser: RequestWithUser;
  let res: Response;
  let next: NextFunction;
  let appointmentServiceStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      body: {
        title: 'Test Appointment'
      }
    } as Request;

    reqWithUser = {
      user: {
        id: 'user-id-123'
      },
      ...req
    } as unknown as RequestWithUser;

    res = {
      status: sinon.stub().returns({
        json: sinon.stub()
      })
    } as unknown as Response;

    next = sinon.stub().returns(undefined) as NextFunction;

    appointmentServiceStub = sinon.stub(
      appointmentService,
      'createAppointment'
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  test('it should return created appointment with appointment dto', async () => {
    const createdAppointment: Appointment = {
      title: 'Test Appointment',
      id: 'test-id-1',
      appointmentBy: 'user-id-123'
    } as Appointment;

    appointmentServiceStub.resolves(createdAppointment);

    await createAppointment(reqWithUser, res, next);
    sinon.assert.calledOnceWithExactly(appointmentServiceStub, {
      title: req.body.title,
      appointmentBy: reqWithUser.user.id
    });
  });
});

describe('getAppointment', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      user: { id: '123' }
    } as unknown as Request;
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    } as unknown as Response;
    next = sinon.stub().returns;
  });

  afterEach(() => {
    sinon.restore();
  });

  test('it should return appointment with valid user id and appointment id', async () => {
    const userId = '123';
    const appoinmentId = '1';
    const appointmentData = {
      title: 'Test Appointment',
      id: appoinmentId,
      appointmentBy: userId
    } as Appointment;
    const getAppointmentStub = sinon
      .stub(appointmentService, 'getAppointment')
      .resolves(appointmentData);

    await getAppointment(req, res, next);

    sinon.assert.calledOnceWithExactly(
      getAppointmentStub,
      appoinmentId,
      userId
    );
  });
});

describe('deleteAppointment', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let deleteAppointmentStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      user: { id: '1' }
    } as unknown as Request;
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    } as unknown as Response;
    next = sinon.stub().returns(undefined) as NextFunction;
    deleteAppointmentStub = sinon.stub(appointmentService, 'deleteAppointment');
  });

  afterEach(() => {
    sinon.restore();
  });

  test('it should return success when valid id given', async () => {
    const userId = '1';
    const appointmentId = '1';
    deleteAppointmentStub.resolves(
      `Appointment with Id ${appointmentId} deleted successfully`
    );
    await deleteAppointment(req, res, next);
    sinon.assert.calledOnceWithExactly(
      deleteAppointmentStub,
      appointmentId,
      userId
    );
  });
});

describe('updateAppointment', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let updateAppointmentStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      params: { id: '1' },
      user: { id: '1' }
    } as unknown as Request;
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    } as unknown as Response;
    next = sinon.stub().returns(undefined) as NextFunction;
    updateAppointmentStub = sinon.stub(appointmentService, 'updateAppointment');
  });

  afterEach(() => {
    sinon.restore();
  });

  test('it should return success message when valid appointment id and payload', async () => {
    const payload: Appointment = {
      title: 'Test Appointment',
      id: '1',
      appointmentBy: '1'
    } as Appointment;
    req.body = payload;
    updateAppointmentStub.resolves(payload);
    await updateAppointment(req, res, next);
    sinon.assert.calledOnceWithExactly(updateAppointmentStub, req.params.id, {
      ...req.body,
      appointmentBy: (req as RequestWithUser).user.id
    });
  });
});

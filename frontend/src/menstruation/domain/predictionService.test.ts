import { authenticatedUser, IDToken } from '../../user/domain/loginService';
import { Event, predict } from './predictionService';
import { getPrediction, PredictionDTO } from '../data/predictionClient';

jest.mock('../data/predictionClient');
jest.mock('../../user/domain/loginService');

const authenticatedUserMock = authenticatedUser as jest.Mock<
  IDToken | undefined
>;
const getPredictionMock = getPrediction as jest.Mock<Promise<PredictionDTO>>;

describe('predict', () => {
  const today = new Date();
  const in20Days = new Date();
  in20Days.setDate(today.getDate() + 20);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  it('should reject if user can not be found', () => {
    authenticatedUserMock.mockReturnValue(undefined);

    const actual = predict();
    const expected = new Error('User not found');

    return expect(actual).rejects.toStrictEqual(expected);
  });

  it('should return upcoming menstruation event', () => {
    authenticatedUserMock.mockReturnValue({
      name: 'foo bar',
      email: 'foo@bar.com',
      email_verified: true,
      sub: 'foo-bar-000',
    });
    getPredictionMock.mockResolvedValue({
      ovulation: {
        startDate: in20Days.toISOString(),
        isActive: false,
      },
      menstruation: {
        startDate: tomorrow.toISOString(),
        isActive: false,
        duration: 5,
      },
    });

    const actual = predict();
    const expected = {
      event: Event.MENSTRUATION,
      isUpcoming: true,
      days: 5,
    };

    return expect(actual).resolves.toStrictEqual(expected);
  });

  it('should return current menstruation event', () => {
    authenticatedUserMock.mockReturnValue({
      name: 'foo bar',
      email: 'foo@bar.com',
      email_verified: true,
      sub: 'foo-bar-000',
    });
    getPredictionMock.mockResolvedValue({
      ovulation: {
        startDate: in20Days.toISOString(),
        isActive: false,
      },
      menstruation: {
        startDate: tomorrow.toISOString(),
        isActive: true,
        duration: 15,
      },
    });

    const actual = predict();
    const expected = {
      event: Event.MENSTRUATION,
      isUpcoming: false,
      days: 15,
    };

    return expect(actual).resolves.toStrictEqual(expected);
  });

  it('should return upcoming ovulation event', () => {
    authenticatedUserMock.mockReturnValue({
      name: 'foo bar',
      email: 'foo@bar.com',
      email_verified: true,
      sub: 'foo-bar-000',
    });
    getPredictionMock.mockResolvedValue({
      ovulation: {
        startDate: today.toISOString(),
        isActive: false,
      },
      menstruation: {
        startDate: tomorrow.toISOString(),
        isActive: false,
        duration: 5,
      },
    });

    const actual = predict();
    const expected = {
      event: Event.OVULATION,
      isUpcoming: true,
      days: 1,
    };

    return expect(actual).resolves.toStrictEqual(expected);
  });

  it('should return current ovulation event', () => {
    authenticatedUserMock.mockReturnValue({
      name: 'foo bar',
      email: 'foo@bar.com',
      email_verified: true,
      sub: 'foo-bar-000',
    });
    getPredictionMock.mockResolvedValue({
      ovulation: {
        startDate: today.toISOString(),
        isActive: true,
      },
      menstruation: {
        startDate: tomorrow.toISOString(),
        isActive: false,
        duration: 5,
      },
    });

    const actual = predict();
    const expected = {
      event: Event.OVULATION,
      isUpcoming: false,
      days: 1,
    };

    return expect(actual).resolves.toStrictEqual(expected);
  });
});

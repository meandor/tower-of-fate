import axios, { AxiosInstance } from 'axios';
import { getPrediction } from './predictionClient';

jest.mock('axios');

const axiosMock: jest.Mocked<AxiosInstance> = axios as any;
const AXIOS_CONFIG = { withCredentials: true };

describe('getPrediction', () => {
  const prediction = {
    ovulation: {
      startDate: new Date(),
      isActive: false,
    },
    period: {
      startDate: new Date(),
      isActive: true,
      duration: 13,
    },
  };

  beforeEach(() => {
    axiosMock.get.mockResolvedValue({ data: prediction });
  });

  it('should send all stuff to backend', async () => {
    const actual = getPrediction();
    const expected = prediction;

    await expect(actual).resolves.toBe(expected);
    await expect(axiosMock.get).toHaveBeenCalledWith(
      'backend/menstruation/prediction',
      AXIOS_CONFIG
    );
  });
});
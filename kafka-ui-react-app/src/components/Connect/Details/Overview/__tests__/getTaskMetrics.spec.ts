import { tasks } from 'lib/fixtures/kafkaConnect';
import getTaskMetrics from 'components/Connect/Details/Overview/getTaskMetrics';

describe('getTaskMetrics', () => {
  it('should return the correct metrics when task list is undefined', () => {
    const metrics = getTaskMetrics();
    expect(metrics).toEqual({
      running: 0,
      failed: 0,
    });
  });

  it('should return the correct metrics', () => {
    expect(getTaskMetrics(tasks)).toEqual({
      running: 2,
      failed: 1,
    });
  });
});

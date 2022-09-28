import fetchMock from 'fetch-mock';
import * as hooks from 'lib/hooks/api/actuatorInfo';
import { expectQueryWorks, renderQueryHook } from 'lib/testHelpers';
import { actuatorInfoPayload } from 'lib/fixtures/actuatorInfo';

const actuatorInfoPath = '/actuator/info';

describe('Actuator info hooks', () => {
  beforeEach(() => fetchMock.restore());
  describe('useActuatorInfo', () => {
    it('returns the correct data', async () => {
      const mock = fetchMock.getOnce(actuatorInfoPath, actuatorInfoPayload());
      const { result } = renderQueryHook(() => hooks.useActuatorInfo());
      await expectQueryWorks(mock, result);
    });
  });
});

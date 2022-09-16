import { useQuery } from '@tanstack/react-query';
import { BASE_PARAMS } from 'lib/constants';

const fetchActuatorInfo = async () => {
  const data = await fetch('/actuator/info', BASE_PARAMS).then((res) =>
    res.json()
  );

  return data;
};

export function useActuatorInfoStats() {
  return useQuery(['actuatorInfo'], fetchActuatorInfo);
}

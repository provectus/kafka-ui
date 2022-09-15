import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from 'lib/constants';

const fetchActuatorInfo = async () => {
  const data = await fetch(`${BASE_URL}/actuator/info`)
    .then((res) => res.json())
    .catch((e) => console.log(e));
  return data;
};

export function useActuatorInfoStats() {
  return useQuery(['git'], fetchActuatorInfo);
}

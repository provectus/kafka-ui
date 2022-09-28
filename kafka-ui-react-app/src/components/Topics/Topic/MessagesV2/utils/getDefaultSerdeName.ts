import { SerdeDescription } from 'generated-sources';
import { getPrefferedDescription } from 'components/Topics/Topic/SendMessage/utils';

export const getDefaultSerdeName = (serdes: SerdeDescription[]) => {
  const preffered = getPrefferedDescription(serdes);
  if (preffered) {
    return preffered.name || '';
  }
  if (serdes.length > 0) {
    return serdes[0].name || '';
  }
  return '';
};

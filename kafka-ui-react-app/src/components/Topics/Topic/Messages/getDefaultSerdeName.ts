import { SerdeDescription } from 'generated-sources';
import { getPreferredDescription } from 'components/Topics/Topic/SendMessage/utils';

export const getDefaultSerdeName = (serdes: SerdeDescription[]) => {
  const preffered = getPreferredDescription(serdes);
  if (preffered) {
    return preffered.name || '';
  }
  if (serdes.length > 0) {
    return serdes[0].name || '';
  }
  return '';
};

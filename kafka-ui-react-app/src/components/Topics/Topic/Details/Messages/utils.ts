import { Option } from 'react-multi-select-component/dist/lib/interfaces';

export const filterOptions = (options: Option[], filter: string) => {
  if (!filter) {
    return options;
  }
  return options.filter(
    ({ value }) => value.toString() && value.toString() === filter
  );
};

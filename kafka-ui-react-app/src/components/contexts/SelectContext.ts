import React from 'react';

export interface SelectContextProps {
  selectedOption: string | number;
  changeSelectedOption: (option: string | number) => void;
}

export const selectInitialValue: SelectContextProps = {
  selectedOption: '',
  changeSelectedOption: () => {},
};

const SelectContext = React.createContext(selectInitialValue);
const useSelectContext = () => React.useContext(SelectContext);

export { SelectContext, useSelectContext };

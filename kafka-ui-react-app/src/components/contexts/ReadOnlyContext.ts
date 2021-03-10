import React from 'react';

const initialValue: { isReadOnly: boolean | undefined } = {
  isReadOnly: undefined,
};
const ReadOnlyContext = React.createContext(initialValue);

export default ReadOnlyContext;

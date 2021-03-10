import React from 'react';

const initialValue: { isReadOnly: boolean } = {
  isReadOnly: false,
};
const ClusterContext = React.createContext(initialValue);

export default ClusterContext;

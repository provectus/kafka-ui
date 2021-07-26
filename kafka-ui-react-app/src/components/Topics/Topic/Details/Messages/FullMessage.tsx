import React from 'react';
import JSONTree from 'react-json-tree';

import theme from './theme';

interface FullMessageProps {
  message: string;
}

const FullMessage: React.FC<FullMessageProps> = ({ message }) => {
  try {
    return (
      <JSONTree
        data={JSON.parse(message)}
        theme={theme}
        shouldExpandNode={() => true}
        hideRoot
      />
    );
  } catch (e) {
    return <p>{JSON.stringify(message)}</p>;
  }
};

export default FullMessage;

import React from 'react';
import JSONTree from 'react-json-tree';

import theme from './theme';

interface FullMessageProps {
  data: string;
}

const JSONViewer: React.FC<FullMessageProps> = ({ data }) => {
  try {
    return (
      <JSONTree
        data={JSON.parse(data)}
        theme={theme}
        shouldExpandNode={() => true}
        hideRoot
      />
    );
  } catch (e) {
    return <p>{JSON.stringify(data)}</p>;
  }
};

export default JSONViewer;

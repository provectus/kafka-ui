import React from 'react';
import JSONTree from 'react-json-tree';
import theme from './themes/grayscale';

interface JSONViewerProps {
  data: {
    [key: string]: string;
  };
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data }) => (
  <JSONTree data={data} theme={theme} invertTheme={false} hideRoot />
);

export default JSONViewer;

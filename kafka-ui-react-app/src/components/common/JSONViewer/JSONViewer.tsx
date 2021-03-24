import React from 'react';
import JSONTree from 'react-json-tree';
import theme from './themes/google';

interface JSONViewerProps {
  data: Record<string, string>;
}

const JSONViewer: React.FC<JSONViewerProps> = ({ data }) => (
  <JSONTree data={data} theme={theme} shouldExpandNode={() => true} hideRoot />
);

export default JSONViewer;

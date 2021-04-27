/* eslint-disable react/jsx-props-no-spreading */
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-textmate';
import React from 'react';

interface JSONEditorProps extends IAceEditorProps {
  isFixedHeight?: boolean;
}

const JSONEditor: React.FC<JSONEditorProps> = (props) => {
  const { isFixedHeight, value } = props;
  return (
    <AceEditor
      mode="json5"
      theme="textmate"
      tabSize={2}
      width="100%"
      height={
        isFixedHeight ? `${(value?.split('\n').length || 32) * 16}px` : '500px'
      }
      wrapEnabled
      {...props}
    />
  );
};

export default JSONEditor;

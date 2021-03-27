import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-dawn';
import React from 'react';

interface JSONEditorProps {
  readonly?: boolean;
  onChange?: (e: string) => void;
  value: string;
  name: string;
}

const JSONEditor: React.FC<JSONEditorProps> = ({
  readonly,
  onChange,
  value,
  name,
}) => {
  return (
    <AceEditor
      mode="json5"
      theme="dawn"
      name={name}
      value={value}
      tabSize={2}
      readOnly={readonly}
      onChange={onChange}
      wrapEnabled
    />
  );
};

export default JSONEditor;

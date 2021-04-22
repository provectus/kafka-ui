import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-dawn';
import React from 'react';
import { Control, Controller } from 'react-hook-form';

interface JSONEditorProps {
  readonly?: boolean;
  onChange?: (e: string) => void;
  value: string;
  name: string;
  control?: Control;
}

const JSONEditor: React.FC<JSONEditorProps> = ({
  readonly,
  onChange,
  value,
  name,
  control,
}) => {
  if (control) {
    return (
      <Controller
        control={control}
        name={name}
        as={
          <AceEditor
            defaultValue={value}
            mode="json5"
            theme="dawn"
            name={name}
            tabSize={2}
            width="100%"
            wrapEnabled
          />
        }
      />
    );
  }
  return (
    <AceEditor
      mode="json5"
      theme="dawn"
      name={name}
      value={value}
      tabSize={2}
      width="100%"
      readOnly={readonly}
      onChange={onChange}
      wrapEnabled
    />
  );
};

export default JSONEditor;

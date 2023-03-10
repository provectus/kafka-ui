import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/mode-protobuf';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { SchemaType } from 'generated-sources';
import React from 'react';
import styled from 'styled-components';

interface EditorProps extends IAceEditorProps {
  isFixedHeight?: boolean;
  schemaType?: string;
}

const Editor = React.forwardRef<AceEditor | null, EditorProps>((props, ref) => {
  const { isFixedHeight, schemaType, ...rest } = props;
  return (
    <AceEditor
      ref={ref}
      mode={
        schemaType === SchemaType.JSON || schemaType === SchemaType.AVRO
          ? 'json5'
          : 'protobuf'
      }
      theme="tomorrow"
      tabSize={2}
      width="100%"
      fontSize={14}
      height={
        isFixedHeight
          ? `${(props.value?.split('\n').length || 32) * 19}px`
          : '372px'
      }
      wrapEnabled
      {...rest}
    />
  );
});

Editor.displayName = 'Editor';

export default styled(Editor)`
  &.ace-tomorrow {
    background: transparent;
  }
`;

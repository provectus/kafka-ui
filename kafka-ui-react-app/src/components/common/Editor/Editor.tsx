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
    .ace_gutter {
      background-color: ${({ theme }) =>
        theme.ksqlDb.query.editor.layer.backgroundColor};
    }
    .ace_gutter-active-line {
      background-color: ${({ theme }) =>
        theme.ksqlDb.query.editor.cell.backgroundColor};
      color: ${({ theme }) => theme.default.color.normal};
    }
    .ace_scroller {
      background-color: ${({ theme }) => theme.default.backgroundColor};
    }
    .ace_line {
      color: ${({ theme }) => theme.default.color.normal};
    }
    .ace_cursor {
      color: ${({ theme }) => theme.ksqlDb.query.editor.cursor};
    }
    .ace_active-line {
      background-color: ${({ theme }) =>
        theme.ksqlDb.query.editor.cell.backgroundColor};
    }
    .ace_gutter-cell {
      color: ${({ theme }) => theme.default.color.normal};
    }
    .ace_variable {
      color: ${({ theme }) => theme.ksqlDb.query.editor.variable};
    }
    .ace_string {
      color: ${({ theme }) => theme.ksqlDb.query.editor.aceString};
    }
    .ace_print-margin {
      display: none;
    }
  }
`;

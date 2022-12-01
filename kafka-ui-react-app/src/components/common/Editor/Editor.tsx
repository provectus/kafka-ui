/* eslint-disable react/jsx-props-no-spreading */
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/mode-protobuf';
import 'ace-builds/src-noconflict/theme-tomorrow';
import { SchemaType } from 'generated-sources';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import styled from 'styled-components';

interface EditorProps extends IAceEditorProps {
  isFixedHeight?: boolean;
  schemaType?: string;
}

const Editor = React.forwardRef<ReactAce | null, EditorProps>((props, ref) => {
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
      color: ${({ theme }) => theme.ksqlDb.query.editor.layer.color};
    }
    .ace_line {
      background-color: ${({ theme }) =>
        theme.ksqlDb.query.editor.content.backgroundColor};
      color: ${({ theme }) => theme.ksqlDb.query.editor.content.color};
    }
    .ace_cursor {
      color: ${({ theme }) => theme.ksqlDb.query.editor.cursor};
    }
    .ace_active-line {
      background-color: ${({ theme }) =>
        theme.ksqlDb.query.editor.cell.backgroundColor};
    }
    .ace_gutter-cell {
      color: ${({ theme }) => theme.ksqlDb.query.editor.content.color};
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

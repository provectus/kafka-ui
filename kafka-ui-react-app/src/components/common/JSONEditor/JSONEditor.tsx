/* eslint-disable react/jsx-props-no-spreading */
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-tomorrow';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';
import styled from 'styled-components';

interface JSONEditorProps extends IAceEditorProps {
  isFixedHeight?: boolean;
}

const JSONEditor = React.forwardRef<ReactAce | null, JSONEditorProps>(
  (props, ref) => {
    const { isFixedHeight, ...rest } = props;
    return (
      <AceEditor
        ref={ref}
        mode="json5"
        theme="tomorrow"
        tabSize={2}
        width="100%"
        fontSize={14}
        height={
          isFixedHeight
            ? `${(props.value?.split('\n').length || 32) * 16}px`
            : '372px'
        }
        wrapEnabled
        {...rest}
      />
    );
  }
);

JSONEditor.displayName = 'JSONEditor';

export default styled(JSONEditor)`
  &.ace-tomorrow {
    background: transparent;
  }
`;

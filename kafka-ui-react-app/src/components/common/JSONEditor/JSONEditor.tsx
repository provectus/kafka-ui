/* eslint-disable react/jsx-props-no-spreading */
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-textmate';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';

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
        theme="textmate"
        tabSize={2}
        width="100%"
        height={
          isFixedHeight
            ? `${(props.value?.split('\n').length || 32) * 16}px`
            : '500px'
        }
        wrapEnabled
        {...rest}
      />
    );
  }
);

JSONEditor.displayName = 'JSONEditor';

export default JSONEditor;

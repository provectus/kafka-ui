/* eslint-disable react/jsx-props-no-spreading */
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-textmate';
import React from 'react';
import ReactAce from 'react-ace/lib/ace';

interface SQLEditorProps extends IAceEditorProps {
  isFixedHeight?: boolean;
}

const SQLEditor = React.forwardRef<ReactAce | null, SQLEditorProps>(
  (props, ref) => {
    const { isFixedHeight, ...rest } = props;
    return (
      <AceEditor
        ref={ref}
        mode="sql"
        theme="textmate"
        tabSize={2}
        width="100%"
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

SQLEditor.displayName = 'SQLEditor';

export default SQLEditor;

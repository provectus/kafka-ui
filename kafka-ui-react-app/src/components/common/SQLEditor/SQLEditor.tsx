/* eslint-disable react/jsx-props-no-spreading */
import AceEditor, { IAceEditorProps } from 'react-ace';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/theme-dracula';
import React, { useContext } from 'react';
import { ThemeModeContext } from 'components/contexts/ThemeModeContext';

interface SQLEditorProps extends IAceEditorProps {
  isFixedHeight?: boolean;
}

const SQLEditor = React.forwardRef<AceEditor | null, SQLEditorProps>(
  (props, ref) => {
    const { isFixedHeight, ...rest } = props;
    const { isDarkMode } = useContext(ThemeModeContext);

    return (
      <AceEditor
        ref={ref}
        mode="sql"
        theme={isDarkMode ? 'dracula' : 'textmate'}
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

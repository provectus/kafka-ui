/* eslint-disable react/jsx-props-no-spreading */
import { diff as DiffEditor } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/theme-textmate';
import React from 'react';
import { IDiffEditorProps } from 'react-ace/lib/diff';

interface DiffViewerProps extends IDiffEditorProps {
  isFixedHeight?: boolean;
}

const DiffViewer = React.forwardRef<DiffEditor | null, DiffViewerProps>(
  (props, ref) => {
    const { isFixedHeight, ...rest } = props;
    const autoHeight =
      !isFixedHeight && props.value && props.value.length === 2
        ? Math.max(
            props.value[0].split(/\r\n|\r|\n/).length + 1,
            props.value[1].split(/\r\n|\r|\n/).length + 1
          ) * 16
        : 500;
    console.log(rest);
    console.log(props);

    return (
      <DiffEditor
        name="diff-editor"
        ref={ref}
        mode="json5"
        theme="textmate"
        tabSize={2}
        width="100%"
        height={`${autoHeight}px`}
        showPrintMargin={false}
        maxLines={Infinity}
        readOnly
        wrapEnabled
        {...rest}
      />
    );
  }
);

DiffViewer.displayName = 'DiffViewer';

export default DiffViewer;

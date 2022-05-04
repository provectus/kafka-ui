import { diff as DiffEditor } from 'react-ace';
import 'ace-builds/src-noconflict/mode-json5';
import 'ace-builds/src-noconflict/mode-protobuf';
import 'ace-builds/src-noconflict/theme-textmate';
import React from 'react';
import { IDiffEditorProps } from 'react-ace/lib/diff';
import { SchemaType } from 'generated-sources';

interface DiffViewerProps extends IDiffEditorProps {
  isFixedHeight?: boolean;
  schemaType: string;
}

const DiffViewer = React.forwardRef<DiffEditor | null, DiffViewerProps>(
  (props, ref) => {
    const { isFixedHeight, schemaType, ...rest } = props;
    const autoHeight =
      !isFixedHeight && props.value && props.value.length === 2
        ? Math.max(
            props.value[0].split(/\r\n|\r|\n/).length + 1,
            props.value[1].split(/\r\n|\r|\n/).length + 1
          ) * 16
        : 500;
    return (
      <div data-testid="diffviewer">
        <DiffEditor
          name="diff-editor"
          ref={ref}
          mode={
            schemaType === SchemaType.JSON || schemaType === SchemaType.AVRO
              ? 'json5'
              : 'protobuf'
          }
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
      </div>
    );
  }
);

DiffViewer.displayName = 'DiffViewer';

export default DiffViewer;

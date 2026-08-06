import React from 'react';
import { IAceEditorProps } from 'react-ace';
import Editor from 'components/common/Editor/Editor';
import { SchemaType } from 'generated-sources';
import { parse, stringify } from 'lossless-json';

import * as S from './EditorViewer.styled';

export interface EditorViewerProps {
  data: string;
  schemaType?: string;
  maxLines?: number;
  // Gives the caller access to the underlying Ace instance, e.g. to drive
  // search. Not called when the data fails to parse and the plain text
  // fallback below is rendered instead.
  onLoad?: IAceEditorProps['onLoad'];
}
const getSchemaValue = (data: string, schemaType?: string) => {
  if (schemaType === SchemaType.JSON || schemaType === SchemaType.AVRO) {
    return stringify(parse(data), undefined, '\t');
  }
  return data;
};
const EditorViewer: React.FC<EditorViewerProps> = ({
  data,
  schemaType,
  maxLines,
  onLoad,
}) => {
  try {
    return (
      <S.Wrapper>
        <Editor
          isFixedHeight
          schemaType={schemaType}
          name="schema"
          value={getSchemaValue(data, schemaType)}
          setOptions={{
            showLineNumbers: false,
            maxLines,
            showGutter: false,
          }}
          onLoad={onLoad}
          readOnly
        />
      </S.Wrapper>
    );
  } catch (e) {
    return (
      <S.Wrapper>
        <p>{data}</p>
      </S.Wrapper>
    );
  }
};

export default EditorViewer;

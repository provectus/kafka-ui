import React from 'react';
import Editor from 'components/common/Editor/Editor';
import { SchemaType } from 'generated-sources';

import { StyledWrapper } from './StyledWrapper.styled';

export interface FullMessageProps {
  data: string;
  schemaType?: string;
  maxLines?: number;
}

const getSchemaValue = (data: string, schemaType?: string) => {
  if (schemaType === SchemaType.JSON || schemaType === SchemaType.AVRO) {
    return JSON.stringify(JSON.parse(data), null, '\t');
  }
  return data;
};
const JSONViewer: React.FC<FullMessageProps> = ({
  data,
  schemaType,
  maxLines,
}) => {
  try {
    return (
      <StyledWrapper data-testid="json-viewer">
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
          readOnly
        />
      </StyledWrapper>
    );
  } catch (e) {
    return (
      <StyledWrapper data-testid="json-viewer">
        <p>{data}</p>
      </StyledWrapper>
    );
  }
};

export default JSONViewer;

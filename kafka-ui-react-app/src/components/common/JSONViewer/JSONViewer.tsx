import React from 'react';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

import { StyledWrapper } from './StyledWrapper.styled';

interface FullMessageProps {
  data: string;
  schemaType?: string;
}

const getSchemaValue = (data: string, schemaType?: string) => {
  if (schemaType === 'JSON' || schemaType === 'AVRO') {
    return JSON.stringify(JSON.parse(data), null, '\t');
  }
  return data;
};

const JSONViewer: React.FC<FullMessageProps> = ({ data, schemaType }) => {
  try {
    return (
      <StyledWrapper data-testid="json-viewer">
        <JSONEditor
          isFixedHeight
          schemaType={schemaType}
          name="schema"
          value={getSchemaValue(data, schemaType)}
          setOptions={{
            showLineNumbers: false,
            maxLines: 40,
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

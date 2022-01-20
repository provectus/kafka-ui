import React from 'react';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

import { StyledWrapper } from './StyledWrapper.styled';

export interface FullMessageProps {
  data: string;
  maxLines?: number;
}

const JSONViewer: React.FC<FullMessageProps> = ({ data, maxLines }) => {
  try {
    if (data.trim().startsWith('{')) {
      return (
        <StyledWrapper data-testid="json-viewer">
          <JSONEditor
            isFixedHeight
            name="schema"
            value={JSON.stringify(JSON.parse(data), null, '\t')}
            setOptions={{
              showLineNumbers: false,
              maxLines,
              showGutter: false,
            }}
            readOnly
          />
        </StyledWrapper>
      );
    }

    return (
      <StyledWrapper data-testid="json-viewer">
        <p>{JSON.stringify(data)}</p>
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

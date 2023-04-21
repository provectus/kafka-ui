import styled from 'styled-components';

export const StyledForm = styled.form`
  padding: 16px;
  max-width: 800px;
  display: flex;
  gap: 16px;
  flex-direction: column;

  h3 {
    margin-bottom: 0;
    line-height: 32px;
  }
`;

export const FlexFieldset = styled.fieldset`
  display: flex;
  gap: 16px;
  flex-direction: column;

  &:disabled {
    ul {
      opacity: 0.5;
      background-color: #f5f5f5;
      pointer-events: none;
    }
  }
`;

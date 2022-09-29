import styled from 'styled-components';

export const Form = styled.form`
  padding: 16px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 50%;

  & > button {
    align-self: flex-start;
  }

  & textarea {
    height: 200px;
  }
  & select {
    width: 30%;
  }
`;

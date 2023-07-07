import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.layout.stuffColor};
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 2px;
  max-height: 700px;

  & > * {
    background-color: ${({ theme }) => theme.default.backgroundColor};
    padding: 24px;
    overflow-y: scroll;
  }

  p {
    color: ${({ theme }) => theme.schema.backgroundColor.p};
  }
`;
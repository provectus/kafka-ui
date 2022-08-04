import styled from 'styled-components';

export const Wrapper = styled.div`
  padding: 16px;
  padding-top: 0;

  & > form {
    display: flex;
    flex-direction: column;
    gap: 16px;

    & > button:last-child {
      align-self: flex-start;
    }
  }

  & .multi-select {
    height: 32px;
    & > .dropdown-container {
      height: 32px;
      & > .dropdown-heading {
        height: 32px;
      }
    }
  }
`;

export const MainSelectors = styled.div`
  display: flex;
  gap: 16px;
  & > * {
    flex-grow: 1;
  }
`;

export const OffsetsWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 16px;
`;

export const OffsetsTitle = styled.h1`
  font-size: 18px;
  font-weight: 500;
`;

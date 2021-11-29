import React from 'react';
import styled from 'styled-components';
import { Colors } from 'theme/theme';

const LoaderStyled = styled.div`
  border: 10px solid ${Colors.brand[50]};
  border-bottom: 10px solid ${Colors.neutral[0]};
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1.3s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 15%;
  height: 100%;
  width: 100%;
`;

const PageLoader: React.FC = () => (
  <LoaderWrapper>
    <LoaderStyled role="progressbar" />
  </LoaderWrapper>
);

export default PageLoader;

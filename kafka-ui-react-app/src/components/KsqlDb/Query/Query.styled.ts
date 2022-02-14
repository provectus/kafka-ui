import PageLoader from 'components/common/PageLoader/PageLoader';
import styled from 'styled-components';

export const ContinuousLoader = styled(PageLoader)`
  & > div {
    transform: scale(0.5);
    padding-top: 0;
  }
`;

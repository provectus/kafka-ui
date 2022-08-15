import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const Breadcrumbs = styled.div`
  display: flex;
  align-items: baseline;
`;

export const BackLink = styled(NavLink)`
  color: ${({ theme }) => theme.pageHeading.backLink.color.normal};
  position: relative;

  &:hover {
    ${({ theme }) => theme.pageHeading.backLink.color.hover};
  }

  &::after {
    content: '';
    position: absolute;
    right: -11px;
    bottom: 2px;
    border-left: 1px solid ${({ theme }) => theme.pageHeading.dividerColor};
    height: 20px;
    transform: rotate(14deg);
  }
`;

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;

  & > div {
    display: flex;
    gap: 16px;
  }

  & > ${Breadcrumbs} {
    gap: 20px;
  }
`;

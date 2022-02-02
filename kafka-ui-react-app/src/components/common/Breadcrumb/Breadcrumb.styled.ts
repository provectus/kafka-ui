import styled from 'styled-components';

export const BreadcrumbWrapper = styled.ul`
  display: flex;
  padding-left: 16px;
  padding-top: 1em;

  font-size: 12px;

  & li:not(:last-child)::after {
    content: '/';
    color: ${({ theme }) => theme.breadcrumb};
    margin: 0 8px;
  }
`;

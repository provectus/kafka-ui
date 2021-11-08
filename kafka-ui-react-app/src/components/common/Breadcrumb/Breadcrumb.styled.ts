import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const BreadcrumbWrapper = styled.ul`
  display: flex;
  padding-left: 16px;
  padding-top: 1em;

  font-size: 12px;

  & li:not(:last-child)::after {
    content: '/';
    color: ${Colors.neutral[30]};
    margin: 0 8px;
  }
`;

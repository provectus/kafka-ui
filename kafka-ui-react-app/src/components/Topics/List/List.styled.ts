import { Td } from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const Link = styled(NavLink).attrs({ activeClassName: 'is-active' })<{
  $isInternal?: boolean;
}>(
  ({ theme, activeClassName, $isInternal }) => css`
    color: ${theme.topicsList.color.normal};
    font-weight: 500;
    padding-left: ${$isInternal ? '5px' : 0};

    &:hover {
      background-color: ${theme.topicsList.backgroundColor.hover};
      color: ${theme.topicsList.color.hover};
    }

    &.${activeClassName} {
      background-color: ${theme.topicsList.backgroundColor.active};
      color: ${theme.topicsList.color.active};
    }
  `
);

export const ActionsTd = styled(Td)`
  overflow: visible;
  width: 50px;
`;

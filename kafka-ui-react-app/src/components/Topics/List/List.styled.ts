import { Td } from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const TitleCellContent = styled.div`
  width: 450px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Link = styled(NavLink)<{
  $isInternal?: boolean;
}>(
  ({ theme, $isInternal }) => css`
    color: ${theme.topicsList.color.normal};
    font-weight: 500;
    padding-left: ${$isInternal ? '5px' : 0};

    width: 450px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background-color: ${theme.topicsList.backgroundColor.hover};
      color: ${theme.topicsList.color.hover};
    }

    &.active {
      background-color: ${theme.topicsList.backgroundColor.active};
      color: ${theme.topicsList.color.active};
    }
  `
);

export const ActionsTd = styled(Td)`
  overflow: visible;
  width: 50px;
`;

export const ActionsContainer = styled.div`
  text-align: right !important;
`;

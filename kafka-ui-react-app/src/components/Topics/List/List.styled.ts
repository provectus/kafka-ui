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
  ({ $isInternal }) => css`
    padding-left: ${$isInternal ? '5px' : 0};
  `
);

export const ActionsContainer = styled.div`
  text-align: right !important;
`;

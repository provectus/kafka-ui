import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const Link = styled(NavLink).attrs({ activeClassName: 'is-active' })<{
  $isInternal?: boolean;
}>(
  ({ theme, activeClassName, $isInternal }) => css`
    color: ${theme.topicsListStyles.color.normal};
    font-weight: 500;
    padding-left: ${$isInternal ? '5px' : 0};

    &:hover {
      background-color: ${theme.topicsListStyles.backgroundColor.hover};
      color: ${theme.topicsListStyles.color.hover};
    }

    &.${activeClassName} {
      background-color: ${theme.topicsListStyles.backgroundColor.active};
      color: ${theme.topicsListStyles.color.active};
    }
  `
);

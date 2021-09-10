import styled from 'styled-components';

export interface Props {
  liType: 'primary';
  to?: string;
  activeClassName?: string;
  title?: string;
  isInverted?: boolean;
}

const StyledMenuItem = styled('li')<Props>`
  a {
    cursor: pointer;
    text-decoration: none;
    margin: 0px 0px;
    font-family: 'Inter', sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    background: #fff;
    color: #73848c;

    &.is-active {
      background: #e3e6e8;
      color: #171a1c;
    }
  }
`;

StyledMenuItem.displayName = 'StyledMenuItem';

export default StyledMenuItem;

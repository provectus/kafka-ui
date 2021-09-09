import styled from 'styled-components';

export interface Props {
  liType: 'primary' | 'secondary';
  to?: string;
  activeClassName?: string;
  title?: string;
  isInverted?: boolean;
}

const StyledMenuItem = styled('li')<Props>`
  a {
    cursor: pointer;
    text-decoration: none;
    color: #73848c;
    margin: 0px 0px;
    font-family: Inter, sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;

    &.is-active {
      background: #e3e6e8;
      color: #171a1c;
    }
  }
`;

export default StyledMenuItem;

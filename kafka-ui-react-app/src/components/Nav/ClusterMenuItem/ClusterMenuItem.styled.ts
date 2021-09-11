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
    background: ${(props) =>
      props.theme.secondaryTabStyles.backgroundColor.normal};
    color: ${(props) => props.theme.secondaryTabStyles.color.normal};

    &:hover {
      background: ${(props) =>
        props.theme.secondaryTabStyles.backgroundColor.hover};
      color: ${(props) => props.theme.secondaryTabStyles.color.hover};
    }
    &.is-active {
      background: ${(props) =>
        props.theme.secondaryTabStyles.backgroundColor.active};
      color: ${(props) => props.theme.secondaryTabStyles.color.active};
    }
  }
`;

StyledMenuItem.displayName = 'StyledMenuItem';

export default StyledMenuItem;

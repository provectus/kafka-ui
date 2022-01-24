import styled from 'styled-components';
import { Colors } from 'theme/theme';

const Navbar = styled.nav`
  display: flex;
  border-bottom: 1px ${Colors.neutral[10]} solid;
  & a {
    height: 40px;
    width: 96px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 14px;
    color: ${(props) => props.theme.primaryTabStyles.color.normal};
    border-bottom: 1px
      ${(props) => props.theme.primaryTabStyles.borderColor.normal} solid;
    &.is-active {
      border-bottom: 1px
        ${(props) => props.theme.primaryTabStyles.borderColor.active} solid;
      color: ${(props) => props.theme.primaryTabStyles.color.active};
    }
    &:hover:not(.is-active) {
      border-bottom: 1px
        ${(props) => props.theme.primaryTabStyles.borderColor.hover} solid;
      color: ${(props) => props.theme.primaryTabStyles.color.hover};
    }
  }
`;

export default Navbar;

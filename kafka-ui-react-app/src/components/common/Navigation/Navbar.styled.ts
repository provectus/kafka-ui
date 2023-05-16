import styled from 'styled-components';

const Navbar = styled.nav`
  display: flex;
  border-bottom: 1px ${({ theme }) => theme.primaryTab.borderColor.nav} solid;
  height: ${({ theme }) => theme.primaryTab.height};
  & a {
    height: 40px;
    min-width: 96px;
    padding: 0 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
    color: ${({ theme }) => theme.primaryTab.color.normal};
    border-bottom: 1px ${({ theme }) => theme.default.transparentColor} solid;
    &.is-active {
      border-bottom: 1px ${({ theme }) => theme.primaryTab.borderColor.active}
        solid;
      color: ${({ theme }) => theme.primaryTab.color.active};
    }
    &.is-disabled {
      color: ${(props) => props.theme.primaryTab.color.disabled};
      border-bottom: 1px ${({ theme }) => theme.default.transparentColor};
      cursor: not-allowed;
    }
    &:hover:not(.is-active, .is-disabled) {
      border-bottom: 1px ${({ theme }) => theme.default.transparentColor} solid;
      color: ${({ theme }) => theme.primaryTab.color.hover};
    }
  }
`;

export default Navbar;

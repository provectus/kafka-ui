import styled from 'styled-components';

export const SecondaryTabs = styled.nav`
  & button {
    background-color: ${(props) =>
      props.theme.secondaryTabStyles.backgroundColor.normal};
    color: ${(props) => props.theme.secondaryTabStyles.color.normal};
    padding: 6px;
    height: 32px;
    min-width: 57px;
    border: 1px solid ${(props) => props.theme.layout.stuffBorderColor};
    cursor: pointer;

    &:hover {
      background-color: ${(props) =>
        props.theme.secondaryTabStyles.backgroundColor.hover};
      color: ${(props) => props.theme.secondaryTabStyles.color.hover};
    }

    &.is-active {
      background-color: ${(props) =>
        props.theme.secondaryTabStyles.backgroundColor.active};
      color: ${(props) => props.theme.secondaryTabStyles.color.active};
    }
  }

  & > * {
    &:first-child {
      border-radius: 4px 0 0 4px;
    }
    &:last-child {
      border-radius: 0 4px 4px 0;
    }
    &:not(:last-child) {
      border-right: 0px;
    }
  }
`;

import styled from 'styled-components';

export const StyledClusterTab = styled.li`
  font-size: 14px;
  font-weight: 500;
  user-select: none;

  & .cluster-tab-wrapper {
    padding: 0.5em 0.75em;
    cursor: pointer;
    text-decoration: none;
    margin: 0px 0px;
    line-height: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background-color: ${(props) =>
      props.theme.menuStyles.backgroundColor.normal};
    color: ${(props) => props.theme.menuStyles.color.normal};

    &:hover {
      background-color: ${(props) =>
        props.theme.menuStyles.backgroundColor.hover};
      color: ${(props) => props.theme.menuStyles.color.hover};
    }

    & .cluster-tab-l {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
`;

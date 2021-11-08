import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const Wrapper = styled.nav`
  display: flex;
  align-items: flex-end;
  padding: 0 16px;
  gap: 15px;
  padding-top: 25px;

  & > ul {
    display: flex;
    align-items: flex-end;
    & .pagination-link {
      height: 32px;
      &.is-current {
        background-color: ${Colors.brand[50]};
        border-color: ${Colors.brand[50]};
      }
    }
  }

  & .pagination-btn {
    height: 32px;
    border: 1px solid;
    background-color: ${Colors.neutral[0]};
    ${(props) => props.theme.paginationStyles.borderColor.normal};
    border-radius: 4px;
    text-align: center;
    vertical-align: middle;
    color: ${(props) => props.theme.paginationStyles.color.normal};

    display: flex;
    align-items: center;
    padding: 0 12px;

    &:hover {
      border: 1px solid
        ${(props) => props.theme.paginationStyles.borderColor.hover};
      color: ${(props) => props.theme.paginationStyles.color.hover};
      cursor: pointer;
    }
    &:active {
      border: 1px solid
        ${(props) => props.theme.paginationStyles.borderColor.active};
      color: ${(props) => props.theme.paginationStyles.color.active};
    }
    &:disabled {
      border: 1px solid
        ${(props) => props.theme.paginationStyles.borderColor.disabled};
      color: ${(props) => props.theme.paginationStyles.color.disabled};
      cursor: not-allowed;
    }
  }
`;

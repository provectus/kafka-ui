import styled from 'styled-components';
import { Link } from 'react-router-dom';
import theme from 'theme/theme';

export const Wrapper = styled.nav`
  display: flex;
  align-items: flex-end;
  padding: 25px 16px;
  gap: 15px;

  & > ul {
    display: flex;
    align-items: flex-end;

    & > li:not(:last-child) {
      margin-right: 12px;
    }
  }
`;

export const PaginationLink = styled(Link)<{ $isCurrent: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 32px;
  width: 33px;

  border-radius: 4px;
  border: 1px solid
    ${({ $isCurrent }) =>
      $isCurrent
        ? theme.paginationStyles.currentPage
        : theme.paginationStyles.borderColor.normal};
  background-color: ${({ $isCurrent }) =>
    $isCurrent
      ? theme.paginationStyles.currentPage
      : theme.paginationStyles.backgroundColor};
  color: ${theme.paginationStyles.color.normal};

  &:hover {
    border: 1px solid
      ${({ $isCurrent }) =>
        $isCurrent
          ? theme.paginationStyles.currentPage
          : theme.paginationStyles.borderColor.hover};
    color: ${(props) => props.theme.paginationStyles.color.hover};
    cursor: ${({ $isCurrent }) => ($isCurrent ? 'default' : 'pointer')};
  }
`;

export const PaginationButton = styled(Link)`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  height: 32px;
  border: 1px solid ${theme.paginationStyles.borderColor.normal};
  border-radius: 4px;
  color: ${theme.paginationStyles.color.normal};

  &:hover {
    border: 1px solid ${theme.paginationStyles.borderColor.hover};
    color: ${theme.paginationStyles.color.hover};
    cursor: pointer;
  }
  &:active {
    border: 1px solid ${theme.paginationStyles.borderColor.active};
    color: ${theme.paginationStyles.color.active};
  }
  &:disabled {
    border: 1px solid ${theme.paginationStyles.borderColor.disabled};
    color: ${theme.paginationStyles.color.disabled};
    cursor: not-allowed;
  }
`;

export const DisabledButton = styled.button`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  height: 32px;
  border: 1px solid ${theme.paginationStyles.borderColor.disabled};
  background-color: ${theme.paginationStyles.backgroundColor};
  border-radius: 4px;
  font-size: 16px;
  color: ${theme.paginationStyles.color.disabled};
`;

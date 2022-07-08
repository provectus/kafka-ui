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
        ? theme.pagination.currentPage
        : theme.pagination.borderColor.normal};
  background-color: ${({ $isCurrent }) =>
    $isCurrent
      ? theme.pagination.currentPage
      : theme.pagination.backgroundColor};
  color: ${theme.pagination.color.normal};

  &:hover {
    border: 1px solid
      ${({ $isCurrent }) =>
        $isCurrent
          ? theme.pagination.currentPage
          : theme.pagination.borderColor.hover};
    color: ${(props) => props.theme.pagination.color.hover};
    cursor: ${({ $isCurrent }) => ($isCurrent ? 'default' : 'pointer')};
  }
`;

export const PaginationButton = styled(Link)`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  height: 32px;
  border: 1px solid ${theme.pagination.borderColor.normal};
  border-radius: 4px;
  color: ${theme.pagination.color.normal};

  &:hover {
    border: 1px solid ${theme.pagination.borderColor.hover};
    color: ${theme.pagination.color.hover};
    cursor: pointer;
  }
  &:active {
    border: 1px solid ${theme.pagination.borderColor.active};
    color: ${theme.pagination.color.active};
  }
  &:disabled {
    border: 1px solid ${theme.pagination.borderColor.disabled};
    color: ${theme.pagination.color.disabled};
    cursor: not-allowed;
  }
`;

export const DisabledButton = styled.button`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  height: 32px;
  border: 1px solid ${theme.pagination.borderColor.disabled};
  background-color: ${theme.pagination.backgroundColor};
  border-radius: 4px;
  font-size: 16px;
  color: ${theme.pagination.color.disabled};
`;

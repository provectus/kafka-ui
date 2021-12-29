import styled from 'styled-components';
import { Colors } from 'theme/theme';
import { Link } from 'react-router-dom';

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
    ${({ $isCurrent, theme }) =>
      $isCurrent
        ? Colors.neutral[10]
        : theme.paginationStyles.borderColor.normal};
  background-color: ${({ $isCurrent }) =>
    $isCurrent ? Colors.neutral[10] : Colors.neutral[0]};
  color: ${Colors.neutral[90]};

  &:hover {
    border: 1px solid
      ${({ $isCurrent, theme }) =>
        $isCurrent
          ? Colors.neutral[10]
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
  border: 1px solid
    ${(props) => props.theme.paginationStyles.borderColor.normal};
  border-radius: 4px;
  color: ${(props) => props.theme.paginationStyles.color.normal};

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
`;

export const DisabledButton = styled.button`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  height: 32px;
  border: 1px solid
    ${({ theme }) => theme.paginationStyles.borderColor.disabled};
  background-color: ${Colors.neutral[0]};
  border-radius: 4px;
  font-size: 16px;
  color: ${({ theme }) => theme.paginationStyles.borderColor.disabled};
`;

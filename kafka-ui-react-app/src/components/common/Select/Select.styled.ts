import styled from 'styled-components';

interface Props {
  selectSize: 'M' | 'L';
  isLive?: boolean;
  minWidth?: string;
}

export const Select = styled.select<Props>`
  height: ${(props) => (props.selectSize === 'M' ? '32px' : '40px')};
  border: 1px ${(props) => props.theme.selectStyles.borderColor.normal} solid;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  padding-left: ${(props) => (props.isLive ? '36px' : '12px')};
  padding-right: 16px;
  color: ${(props) => props.theme.selectStyles.color.normal};
  min-width: ${({ minWidth }) => minWidth || 'auto'};
  background-image: url('data:image/svg+xml,%3Csvg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M1 1L5 5L9 1" stroke="%23454F54"/%3E%3C/svg%3E%0A') !important;
  background-repeat: no-repeat !important;
  background-position-x: calc(100% - 8px) !important;
  background-position-y: 55% !important;
  appearance: none !important;

  &:hover {
    color: ${(props) => props.theme.selectStyles.color.hover};
    border-color: ${(props) => props.theme.selectStyles.borderColor.hover};
  }
  &:focus {
    outline: none;
    color: ${(props) => props.theme.selectStyles.color.active};
    border-color: ${(props) => props.theme.selectStyles.borderColor.active};
  }
  &:disabled {
    color: ${(props) => props.theme.selectStyles.color.disabled};
    border-color: ${(props) => props.theme.selectStyles.borderColor.disabled};
    cursor: not-allowed;
  }
`;

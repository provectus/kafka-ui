import styled from 'styled-components';

interface Props {
  selectSize: 'M' | 'L';
  isLive?: boolean;
  minWidth?: string;
  disabled?: boolean;
}

interface OptionProps {
  disabled?: boolean;
}

export const Select = styled.ul<Props>`
  position: relative;
  list-style: none;
  display: flex;
  align-items: center;
  height: ${(props) => (props.selectSize === 'M' ? '32px' : '40px')};
  border: 1px
    ${({ theme, disabled }) =>
      disabled
        ? theme.selectStyles.borderColor.disabled
        : theme.selectStyles.borderColor.normal}
    solid;
  border-radius: 4px;
  font-size: 14px;
  width: fit-content;
  padding-left: ${(props) => (props.isLive ? '36px' : '12px')};
  padding-right: 16px;
  color: ${({ theme, disabled }) =>
    disabled
      ? theme.selectStyles.color.disabled
      : theme.selectStyles.color.normal};
  min-width: ${({ minWidth }) => minWidth || 'auto'};
  background-image: ${({ disabled }) =>
    `url('data:image/svg+xml,%3Csvg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M1 1L5 5L9 1" stroke="${
      disabled ? '%23ABB5BA' : '%23454F54'
    }"/%3E%3C/svg%3E%0A') !important`};
  background-repeat: no-repeat !important;
  background-position-x: calc(100% - 8px) !important;
  background-position-y: 55% !important;

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

export const OptionList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  max-height: 114px;
  margin-top: 4px;
  background-color: ${(props) =>
    props.theme.selectStyles.backgroundColor.normal};
  border: 1px ${(props) => props.theme.selectStyles.borderColor.normal} solid;
  border-radius: 4px;
  font-size: 14px;
  line-height: 18px;
  width: 100%;
  color: ${(props) => props.theme.selectStyles.color.normal};
  overflow-y: scroll;
  z-index: 10;
`;

export const Option = styled.li<OptionProps>`
  list-style: none;
  padding: 10px 12px;
  transition: all 0.2s ease-in-out;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    background-color: ${(props) =>
      props.theme.selectStyles.backgroundColor.hover};
  }

  &:active {
    background-color: ${(props) =>
      props.theme.selectStyles.backgroundColor.active};
  }
`;

export const SelectedOption = styled.li`
  padding-right: 16px;
  list-style-position: inside;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

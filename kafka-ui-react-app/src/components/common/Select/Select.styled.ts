import styled from 'styled-components';

interface Props {
  selectSize: 'M' | 'L';
  isLive?: boolean;
  minWidth?: string;
  disabled?: boolean;
  isThemeMode?: boolean;
}

interface OptionListProps {
  maxHeight?: string;
  orientation?: 'L' | 'R';
}

interface OptionProps {
  disabled?: boolean;
}

export const Select = styled.ul<Props>`
  position: relative;
  list-style: none;
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: space-between;
  height: ${(props) => (props.selectSize === 'M' ? '32px' : '40px')};
  border: 1px
    ${({ theme, disabled, isThemeMode }) => {
      if (isThemeMode) {
        return 'none';
      }
      if (disabled) {
        return theme.select.borderColor.disabled;
      }

      return theme.select.borderColor.normal;
    }}
    solid;
  border-radius: 4px;
  font-size: 14px;
  width: fit-content;
  padding-left: 16px;
  padding-right: 12px;
  color: ${({ theme, disabled }) =>
    disabled ? theme.select.color.disabled : theme.select.color.normal};
  min-width: ${({ minWidth }) => minWidth || 'auto'};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  &:hover {
    color: ${({ theme, disabled }) =>
      disabled ? theme.select.color.disabled : theme.select.color.hover};
    border-color: ${({ theme, disabled }) =>
      disabled
        ? theme.select.borderColor.disabled
        : theme.select.borderColor.hover};
  }
  &:focus {
    outline: none;
    color: ${({ theme }) => theme.select.color.active};
    border-color: ${({ theme }) => theme.select.borderColor.active};
  }
  &:disabled {
    color: ${({ theme }) => theme.select.color.disabled};
    border-color: ${({ theme }) => theme.select.borderColor.disabled};
  }
`;

export const SelectedOptionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const OptionListWrapper = styled.div<OptionListProps>`
  display: flex;
  position: absolute;
  top: 100%;
  left: ${({ orientation }) => (orientation === 'R' ? 'unset' : '0')};
  right: ${({ orientation }) => (orientation === 'R' ? '0' : 'unset')};
  max-height: ${({ maxHeight }) => maxHeight || '228px'};
  overflow-y: auto;
  margin-top: 4px;
  background-color: ${({ theme }) => theme.select.backgroundColor.normal};
  border: 1px ${({ theme }) => theme.select.borderColor.normal} solid;
  border-radius: 4px;
  font-size: 14px;
  line-height: 18px;
  color: ${({ theme }) => theme.select.color.normal};
  z-index: 10;
  // max-width: 400px;
  // min-width: 100%;
  // align-items: center;

  & div {
    white-space: nowrap;
  }
  &::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: ${({ theme }) =>
      theme.select.optionList.scrollbar.backgroundColor};
  }

  &::-webkit-scrollbar:horizontal {
    height: 7px;
  }
`;

export const OptionList = styled.ul`
  align-items: center;
  min-width: fit-content;
`;

export const Option = styled.li<OptionProps>`
  display: flex;
  align-items: center;
  list-style: none;
  padding: 10px 12px;
  transition: all 0.2s ease-in-out;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  gap: 5px;
  color: ${({ theme, disabled }) =>
    theme.select.color[disabled ? 'disabled' : 'normal']};

  &:hover {
    background-color: ${({ theme, disabled }) =>
      theme.select.backgroundColor[disabled ? 'normal' : 'hover']};
  }

  &:active {
    background-color: ${({ theme }) => theme.select.backgroundColor.active};
  }
`;

export const SubFormContainer = styled.div`
  width: 280px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  border-left: 1px solid ${({ theme }) => theme.dropdown.borderColor};
`;

export const SubFormWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  padding: 6px 16px;
`;

export const ApplyButtonWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.dropdown.borderColor};
  height: 64px;
  padding: 16px;
`;

export const SelectedOption = styled.li<{ isThemeMode?: boolean }>`
  display: flex;
  padding-right: ${({ isThemeMode }) => (isThemeMode ? '' : '16px')};
  list-style-position: inside;
  white-space: nowrap;
  & svg {
    path {
      fill: ${({ theme }) => theme.defaultIconColor};
    }
  }
  & div {
    display: none;
  }
`;

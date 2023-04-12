import Input from 'components/common/Input/Input';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  padding: 0 16px;
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  margin: 16px 0;
  background-color: ${({ theme }) => theme.pageHeading.dividerColor};
`;

export const CreateLabel = styled(InputLabel)<{ isCheckbox?: boolean }>`
  font-size: 14px;
  display: ${({ isCheckbox }) => (isCheckbox ? 'inline-block' : 'flex')};
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const CreateInput = styled(Input)`
  width: 320px;
`;

export const CreateButtonGroup = styled.div`
  display: flex;
  border-radius: 4px;
  margin-bottom: 8px;
`;

export const CreateCheckboxLabeled = styled(CreateLabel)<{
  isPermissions?: 'allow' | 'deny';
  isPattern?: 'exact' | 'prefix';
  active?: boolean;
}>`
  // display: flex;
  margin: 0;
  font-weight: 400;
  border-radius: 4px;
  border-radius: 0;
  border: 1px solid;
  padding: 6px 16px;
  cursor: pointer;
  background-color: ${({ active, isPermissions, isPattern, theme }) => {
    if (isPermissions) {
      return active
        ? theme.acl.create.radioButtons.green.active.background
        : theme.acl.create.radioButtons.green.normal.background;
    }

    if (isPattern) {
      return active
        ? theme.acl.create.radioButtons.gray.active.background
        : theme.acl.create.radioButtons.gray.normal.background;
    }

    return 'transparent';
  }};
  border-color: ${({ active, isPermissions, isPattern, theme }) => {
    if (isPermissions) {
      return active
        ? theme.acl.create.radioButtons.green.active.background
        : '#E3E6E8';
    }

    if (isPattern) {
      return active
        ? theme.acl.create.radioButtons.gray.active.background
        : '#E3E6E8';
    }

    return 'transparent';
  }};
  color: ${({ active, isPermissions, isPattern, theme }) => {
    if (isPermissions) {
      return active
        ? theme.acl.create.radioButtons.green.active.text
        : theme.acl.create.radioButtons.green.normal.text;
    }

    if (isPattern) {
      return active
        ? theme.acl.create.radioButtons.gray.active.text
        : theme.acl.create.radioButtons.gray.normal.text;
    }

    return 'transparent';
  }};

  &:hover {
    background-color: ${({ isPermissions, isPattern, theme }) => {
      if (isPermissions) {
        return theme.acl.create.radioButtons.green.hover.background;
      }

      if (isPattern) {
        return theme.acl.create.radioButtons.gray.hover.background;
      }

      return 'transparent';
    }};
    border-color: ${({ isPermissions, isPattern, theme }) => {
      if (isPermissions) {
        return theme.acl.create.radioButtons.green.hover.background;
      }

      if (isPattern) {
        return theme.acl.create.radioButtons.gray.hover.background;
      }

      return 'transparent';
    }};
    color: ${({ isPermissions, isPattern, theme }) => {
      if (isPermissions) {
        return theme.acl.create.radioButtons.green.hover.text;
      }

      if (isPattern) {
        return theme.acl.create.radioButtons.gray.hover.text;
      }

      return 'transparent';
    }};
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

export const CreateButton = styled.input`
  appearance: none;
`;

export const CreateFooter = styled.div`
  position: absolute;
  bottom: 0;
  right: 32px;
  text-align: right;

  button {
    display: inline-block;

    &:last-child {
      margin-left: 10px;
    }
  }
`;

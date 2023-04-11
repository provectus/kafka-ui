import { Button } from 'components/common/Button/Button';
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

export const CreateButton = styled(Button)<{
  isPermissions?: 'allow' | 'deny';
  isPattern?: 'exact' | 'prefix';
}>`
  font-weight: 400;
  border-radius: 4px;
  border-radius: 0;
  border: 1px solid transparent;

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
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

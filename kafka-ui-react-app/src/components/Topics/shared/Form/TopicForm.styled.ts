import styled from 'styled-components';
import Input from 'components/common/Input/Input';

export const Column = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  margin-bottom: 16px;
`;

export const NameField = styled.div`
  flex-grow: 1;
`;

export const CustomParamsHeading = styled.h4`
  font-weight: 500;
  color: ${({ theme }) => theme.heading.h4};
`;

export const MessageSizeInput = styled(Input)`
  min-width: 195px;
`;

export const Label = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  & > span {
    font-size: 12px;
    color: ${({ theme }) => theme.topicFormLabel.color};
  }
`;

export const Button = styled.button<{ isActive: boolean }>`
  background-color: ${({ theme, ...props }) =>
    props.isActive
      ? theme.chips.backgroundColor.active
      : theme.chips.backgroundColor.normal};
  color: ${({ theme, ...props }) =>
    props.isActive ? theme.chips.color.active : theme.chips.color.normal};
  height: 24px;
  padding: 0 5px;
  min-width: 51px;
  border: none;
  border-radius: 6px;
  &:hover {
    cursor: pointer;
  }
`;

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

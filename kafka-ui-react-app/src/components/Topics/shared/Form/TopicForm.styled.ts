import styled from 'styled-components';

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
      ? theme.button.primary.backgroundColor.active
      : theme.button.primary.backgroundColor.normal};
  height: 32px;
  width: 46px;
  border: 1px solid
    ${({ theme, ...props }) =>
      props.isActive ? theme.button.border.active : theme.button.primary.color};
  border-radius: 6px;
  &:hover {
    cursor: pointer;
  }
`;

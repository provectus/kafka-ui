import styled from 'styled-components';

export const ConfigList = styled.tr`
  & > td:last-child {
    color: ${({ theme }) => theme.configList.color};
  }
`;
export const ConfigItemCell = styled.td<{ $hasCustomValue: boolean }>`
  font-weight: ${(props) => (props.$hasCustomValue ? 500 : 400)} !important;
`;

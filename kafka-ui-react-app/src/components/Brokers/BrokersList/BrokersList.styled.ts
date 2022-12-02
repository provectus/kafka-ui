import styled from 'styled-components';

export const RowCell = styled.div`
  display: flex;
  width: 100%;
  align-items: center;

  svg {
    width: 18px;
    padding-right: 6px;
  }
`;

export const DangerText = styled.span`
  color: ${({ theme }) => theme.circularAlert.color.error};
`;

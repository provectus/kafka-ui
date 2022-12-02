import styled from 'styled-components';

export const RowCell = styled.div`
  display: flex;
  width: 100%;
  align-items: center;

  svg {
    width: 20px;
    padding-left: 6px;
  }
`;

export const DangerText = styled.span`
  color: ${({ theme }) => theme.circularAlert.color.error};
`;

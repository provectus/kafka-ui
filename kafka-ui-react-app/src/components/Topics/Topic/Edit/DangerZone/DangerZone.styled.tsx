import styled from 'styled-components';
import { Colors } from 'theme/theme';

export const DangerZoneWrapperStyled = styled.div`
  margin-top: 16px;
  padding: 8px 16px;
  border: 1px solid ${Colors.neutral[10]};
  box-sizing: border-box;
  border-radius: 8px;
  margin-bottom: 16px;

  & > div {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export const DangerZoneTitleStyled = styled.h1`
  color: ${Colors.red[50]};
  font-size: 20px;
  padding-bottom: 16px;
`;

export const DagerZoneFormStyled = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 16px;
  & > *:first-child {
    flex-grow: 4;
  }
  & > *:last-child {
    flex-grow: 1;
  }
`;

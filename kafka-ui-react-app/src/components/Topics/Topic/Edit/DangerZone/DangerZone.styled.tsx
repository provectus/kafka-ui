import styled from 'styled-components';

export const Wrapper = styled.div`
  margin-top: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.dangerZone.borderColor};
  box-sizing: border-box;
  width: 768px;

  & > div {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

export const Title = styled.h1`
  color: ${({ theme }) => theme.dangerZone.color.title};
  font-size: 20px;
  padding-bottom: 16px;
`;
export const Warning = styled.div`
  color: ${({ theme }) => theme.dangerZone.color.warningMessage};
  font-size: 12px;
  padding-bottom: 16px;
`;
export const Form = styled.form`
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

import styled from 'styled-components';

export const PreviewModal = styled.div`
  height: auto;
  width: 560px;
  border-radius: 8px;
  background: ${({ theme }) => theme.modal.backgroundColor};
  position: absolute;
  left: 25%;
  border: 1px solid ${({ theme }) => theme.modal.border.contrast};
  box-shadow: ${({ theme }) => theme.modal.shadow};
  padding: 32px;
  z-index: 1;
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
`;

export const EditForm = styled.div`
  font-weight: 500;
  padding-bottom: 7px;
  display: flex;
`;

export const Field = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin-right: 5px;
`;

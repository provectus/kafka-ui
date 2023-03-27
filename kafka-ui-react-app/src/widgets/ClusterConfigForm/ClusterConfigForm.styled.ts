import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import styled from 'styled-components';

export const GroupFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: ${({ theme }) =>
    theme.clusterConfigForm.groupField.backgroundColor};
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 15%);

  hr {
    margin: 10px 0 5px;
  }
`;
const InputContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 30px;
  gap: 8px;
  align-items: stretch;
  max-width: 500px;
`;
export const ButtonWrapper = styled.div`
  display: flex;
  gap: 10px;
`;
export const RemoveButton = styled(IconButtonWrapper)`
  align-self: center;
`;
export const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
`;
export const FlexGrow1 = styled.div`
  flex-grow: 1;
  row-gap: 8px;
  flex-direction: column;
  display: flex;
`;
// KafkaCluster
export const BootstrapServer = styled(InputContainer)`
  grid-template-columns: 3fr 110px 30px;
`;
export const BootstrapServerActions = styled(IconButtonWrapper)`
  align-self: stretch;
  margin-top: 12px;
  margin-left: 8px;
`;
export const Port = styled.div`
  width: 110px;
`;

export const FileUploadInputWrapper = styled.div`
  display: flex;
  height: 40px;
  align-items: center;
  color: ${({ theme }) => theme.clusterConfigForm.fileInput.color}};
`;

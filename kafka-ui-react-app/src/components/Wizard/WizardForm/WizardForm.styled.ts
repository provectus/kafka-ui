import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import styled from 'styled-components';

export const Section = styled.div`
  grid-template-columns: 1.5fr 2.5fr 2fr;
  display: grid;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border-top-width: 1px;
  border-bottom: 1px solid;
  --tw-border-opacity: 1;
  border-bottom-color: rgb(229 231 235 / var(--tw-border-opacity));
`;
export const SectionName = styled.h3`
  --tw-text-opacity: 1;
  color: rgb(17 24 39 / var(--tw-text-opacity));
  line-height: 1.5rem;
  font-weight: 500;
  font-size: 1.125rem;
`;
export const Action = styled.div`
  grid-template-columns: repeat(6, minmax(0, 1fr));
  display: grid;
  gap: 1.5rem;
`;
export const ActionItem = styled.div`
  grid-column: span 6 / span 6;
`;
export const ItemLabelRequired = styled.div`
  align-items: baseline;
  display: flex;
  margin-bottom: 0.5rem;
  & label {
    --tw-text-opacity: 1;
    color: rgb(55 65 81 / var(--tw-text-opacity));
    font-weight: 500;
    line-height: 1.25rem;
    white-space: nowrap;
    display: block;
    margin-right: 0.5rem;
    &::after {
      content: ' *';
      color: red;
    }
  }
`;
export const ItemLabel = styled(ItemLabelRequired)`
  & label {
    &::after {
      content: none;
    }
  }
`;
export const ItemLabelFlex = styled.div`
  align-items: baseline;
  display: flex;
  margin-bottom: 0.5rem;
  & label {
    --tw-text-opacity: 1;
    color: rgb(55 65 81 / var(--tw-text-opacity));
    font-weight: 500;
    line-height: 1.25rem;
    white-space: nowrap;
    display: block;
    margin-right: 0.5rem;
  }
`;
export const P = styled.p`
  font-size: 0.85rem;
  margin-top: 0.25rem;
  line-height: 1rem;
  --tw-text-opacity: 1;
  color: rgb(107 114 128 / var(--tw-text-opacity));
`;
export const ReadOnly = styled.div`
  display: flex;
  & div {
    padding-left: 0.75rem;
    & label {
      font-weight: 500;
      --tw-text-opacity: 1;
      color: rgb(55 65 81 / var(--tw-text-opacity));
      line-height: 1.25rem;
    }
    & p {
      --tw-text-opacity: 1;
      color: rgb(107 114 128 / var(--tw-text-opacity));
    }
  }
`;
export const CheckboxWrapper = styled.div`
  display: flex;
  & label {
    margin-left: 0.7rem;
    cursor: pointer;
  }
`;
export const FileWrapper = styled.div`
  display: flex;
  & label {
    margin-right: 0.7rem;
  }
`;

export const Container = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InputContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 30px;
  gap: 8px;
  align-items: stretch;
  max-width: 500px;
`;
//----------------------------------
// KafkaCluster

export const BootstrapServer = styled(InputContainer)`
  grid-template-columns: 3fr 1fr 30px;
`;
export const RemoveButton = styled(IconButtonWrapper)`
  align-self: center;
`;

// Authentication
export const PartStyled = styled.div`
  padding-top: 1.2rem;
  & > div {
    padding-top: 1rem;
  }
`;
// Kafka Connect
export const ConnectInputWrapper = styled(InputContainer)`
  grid-template-columns: 1fr 30px;
  max-width: 100%;
  & > div > div {
    padding-top: 1rem;
  }
`;

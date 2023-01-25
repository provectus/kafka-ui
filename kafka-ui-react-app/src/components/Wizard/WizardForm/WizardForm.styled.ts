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
  }
`;
export const FileWrapper = styled.div`
  display: flex;
  & label {
    margin-right: 0.7rem;
  }
`;

//----------------------------------
// KafkaCluster
export const BootstrapServersContainer = styled.label`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const InputsContainer = styled.div`
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
`;
export const BootstrapServersWrapper = styled.div`
  & {
    width: 100%;
  }
  & > input {
    width: 100%;
    height: 40px;
    border: 1px solid grey;
    border-radius: 4px;
    font-size: 16px;
    padding-left: 15px;
  }
`;
export const DeleteButtonWrapper = styled.div`
  min-height: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: flex-start;
  margin-top: 10px;
`;

//-------------------------------
// Authentication
export const PartStyled = styled.div`
  padding-top: 1.2rem;
`;

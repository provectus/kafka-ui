import * as React from 'react';
import * as S from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { useFieldArray, useFormContext } from 'react-hook-form';
import PlusIcon from 'components/common/Icons/PlusIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseCircleIcon from 'components/common/Icons/CloseCircleIcon';
import {
  FlexGrow1,
  FlexRow,
} from 'widgets/ClusterConfigForm/ClusterConfigForm.styled';
import SectionHeader from 'widgets/ClusterConfigForm/common/SectionHeader';
import Credentials from 'widgets/ClusterConfigForm/common/Credentials';
import SSLForm from 'widgets/ClusterConfigForm/common/SSLForm';

const KafkaConnect = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'kafkaConnect',
  });
  const handleAppend = () => append({ name: '', address: '' });
  const toggleConfig = () => (fields.length === 0 ? handleAppend() : remove());

  const hasFields = fields.length > 0;

  return (
    <>
      <SectionHeader
        title="Kafka Connect"
        addButtonText="Configure Kafka Connect"
        adding={!hasFields}
        onClick={toggleConfig}
      />
      {hasFields && (
        <S.GroupFieldWrapper>
          {fields.map((item, index) => (
            <div key={item.id}>
              <FlexRow>
                <FlexGrow1>
                  <Input
                    label="Kafka Connect name *"
                    name={`kafkaConnect.${index}.name`}
                    placeholder="Name"
                    type="text"
                    hint="Given name for the Kafka Connect cluster"
                    withError
                  />
                  <Input
                    label="Kafka Connect URL *"
                    name={`kafkaConnect.${index}.address`}
                    placeholder="URl"
                    type="text"
                    hint="Address of the Kafka Connect service endpoint"
                    withError
                  />
                  <Credentials
                    prefix={`kafkaConnect.${index}`}
                    title="Is connect secured with auth?"
                  />
                  <SSLForm
                    prefix={`kafkaConnect.${index}.keystore`}
                    title="Keystore"
                  />
                </FlexGrow1>
                <S.RemoveButton onClick={() => remove(index)}>
                  <IconButtonWrapper aria-label="deleteProperty">
                    <CloseCircleIcon aria-hidden />
                  </IconButtonWrapper>
                </S.RemoveButton>
              </FlexRow>

              <hr />
            </div>
          ))}
          <Button
            type="button"
            buttonSize="M"
            buttonType="secondary"
            onClick={handleAppend}
          >
            <PlusIcon />
            Add Kafka Connect
          </Button>
        </S.GroupFieldWrapper>
      )}
    </>
  );
};
export default KafkaConnect;

import * as React from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { useFieldArray, useFormContext } from 'react-hook-form';
import PlusIcon from 'components/common/Icons/PlusIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import Heading from 'components/common/heading/Heading.styled';
import Checkbox from 'components/common/Checkbox/Checkbox';
import {
  FlexGrow1,
  FlexRow,
} from 'components/Wizard/WizardForm/WizardForm.styled';

const KafkaConnect = () => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'kafkaConnect',
  });
  const handleAppend = () => append({});
  const clearConfig = () => setValue('kafkaConnect', []);

  return (
    <>
      <FlexRow>
        <FlexGrow1>
          <Heading level={3}>Kafka Connect</Heading>
        </FlexGrow1>
        {fields.length === 0 ? (
          <Button buttonSize="M" buttonType="primary" onClick={handleAppend}>
            Add Kafka Connect
          </Button>
        ) : (
          <Button buttonSize="M" buttonType="primary" onClick={clearConfig}>
            Remove From Config
          </Button>
        )}
      </FlexRow>
      {fields.length > 0 && (
        <S.ArrayFieldWrapper>
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
                    name={`kafkaConnect.${index}.url`}
                    placeholder="URl"
                    type="text"
                    hint="Address of the Kafka Connect service endpoint"
                    withError
                  />
                  <Checkbox
                    name={`kafkaConnect.${index}.isAuth`}
                    label="Kafka Connect is secured with auth?"
                  />
                </FlexGrow1>
                <S.RemoveButton onClick={() => remove(index)}>
                  <IconButtonWrapper aria-label="deleteProperty">
                    <CloseIcon aria-hidden />
                  </IconButtonWrapper>
                </S.RemoveButton>
              </FlexRow>
              {watch(`kafkaConnect.${index}.isAuth`) && (
                <FlexRow>
                  <FlexGrow1>
                    <Input
                      label="Username"
                      name={`kafkaConnect.${index}.username`}
                      type="text"
                      withError
                    />
                  </FlexGrow1>
                  <FlexGrow1>
                    <Input
                      label="Password"
                      name={`kafkaConnect.${index}.password`}
                      type="password"
                      withError
                    />
                  </FlexGrow1>
                </FlexRow>
              )}
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
        </S.ArrayFieldWrapper>
      )}
    </>
  );
};
export default KafkaConnect;

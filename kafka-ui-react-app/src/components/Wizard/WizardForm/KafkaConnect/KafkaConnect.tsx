import React, { useEffect, useState } from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError, InputHint } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFieldArray, useFormContext } from 'react-hook-form';
import PlusIcon from 'components/common/Icons/PlusIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import Heading from 'components/common/heading/Heading.styled';
import { InputLabel } from 'components/common/Input/InputLabel.styled';

const KafkaConnect = () => {
  const [newKafkaConnect, setNewKafkaConnect] = useState(false);
  const {
    control,
    register,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useFormContext();
  const showConnects = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setNewKafkaConnect(!newKafkaConnect);
  };
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'kafkaConnect',
  });
  const connects = getValues('kafkaConnect');
  useEffect(() => {
    if (connects.length < 1) {
      setNewKafkaConnect(false);
      reset({
        ...getValues(),
        kafkaConnect: [],
      });
    }
  }, [connects]);

  return (
    <>
      <Heading level={3}>Kafka Connect</Heading>
      {newKafkaConnect ? (
        <S.Container>
          {fields.map((item, index) => (
            <div key={item.id}>
              <S.ConnectInputWrapper>
                <div>
                  <div>
                    <S.ItemLabelFlex>
                      <InputLabel htmlFor="kafkaConnect.name">
                        Kafka Connect name *
                      </InputLabel>
                      <InputHint>
                        Given name for the Kafka Connect cluster
                      </InputHint>
                    </S.ItemLabelFlex>
                    <Input
                      name={`kafkaConnect.${index}.name`}
                      placeholder="Name"
                      aria-label="name"
                      type="text"
                    />
                    <FormError>
                      <ErrorMessage
                        errors={errors}
                        name={`kafkaConnect.${index}.name`}
                      />
                    </FormError>
                  </div>
                  <div>
                    <S.ItemLabelFlex>
                      <InputLabel htmlFor="kafkaConnect.url">
                        Kafka Connect URL *
                      </InputLabel>
                      <InputHint>
                        Address of the Kafka Connect service endpoint
                      </InputHint>
                    </S.ItemLabelFlex>
                    <Input
                      name={`kafkaConnect.${index}.url`}
                      placeholder="URl"
                      aria-label="url"
                      type="text"
                    />
                    <FormError>
                      <ErrorMessage
                        errors={errors}
                        name={`kafkaConnect.${index}.url`}
                      />
                    </FormError>
                  </div>
                  <div>
                    <InputLabel>
                      <input
                        {...register(`kafkaConnect.${index}.isAuth`)}
                        id={`kafkaConnect.${index}.isAuth`}
                        name={`kafkaConnect.${index}.isAuth`}
                        type="checkbox"
                      />
                      Kafka Connect is secured with auth?
                    </InputLabel>
                    <FormError>
                      <ErrorMessage
                        errors={errors}
                        name={`kafkaConnect.${index}.isAuth`}
                      />
                    </FormError>
                  </div>
                </div>
                <S.RemoveButton onClick={() => remove(index)}>
                  <IconButtonWrapper aria-label="deleteProperty">
                    <CloseIcon aria-hidden />
                  </IconButtonWrapper>
                </S.RemoveButton>
              </S.ConnectInputWrapper>
              {watch(`kafkaConnect.${index}.isAuth`) && (
                <S.InputContainer>
                  <div>
                    <S.ItemLabelFlex>
                      <label htmlFor={`kafkaConnect.${index}.username`}>
                        Username
                      </label>{' '}
                    </S.ItemLabelFlex>
                    <Input
                      id={`kafkaConnect.${index}.username`}
                      type="text"
                      name={`kafkaConnect.${index}.username`}
                    />
                    <FormError>
                      <ErrorMessage
                        errors={errors}
                        name={`kafkaConnect.${index}.username`}
                      />
                    </FormError>
                  </div>
                  <div>
                    <S.ItemLabelFlex>
                      <label htmlFor={`kafkaConnect.${index}.password`}>
                        Password
                      </label>{' '}
                    </S.ItemLabelFlex>
                    <Input
                      id={`kafkaConnect.${index}.password`}
                      type="password"
                      name={`kafkaConnect.${index}.password`}
                    />
                    <FormError>
                      <ErrorMessage
                        errors={errors}
                        name={`kafkaConnect.${index}.password`}
                      />
                    </FormError>
                  </div>
                </S.InputContainer>
              )}
            </div>
          ))}
          <div>
            <Button
              type="button"
              buttonSize="M"
              buttonType="secondary"
              onClick={() =>
                append({
                  name: '',
                  url: '',
                  isAuth: false,
                  username: '',
                  password: ',',
                })
              }
            >
              <PlusIcon />
              Add Bootstrap Server
            </Button>
          </div>
        </S.Container>
      ) : (
        <div>
          <Button
            buttonSize="M"
            buttonType="primary"
            onClick={(e) => showConnects(e)}
          >
            ADD Kafka Connect
          </Button>
        </div>
      )}
    </>
  );
};
export default KafkaConnect;

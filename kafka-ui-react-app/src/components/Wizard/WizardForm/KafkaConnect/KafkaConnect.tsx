import React, { useEffect, useState } from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';
import PlusIcon from 'components/common/Icons/PlusIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';

type PropType = {
  handleAddKafkaConnect: (e: React.MouseEvent<HTMLButtonElement>) => void;
  remove: (index: number) => void;
  fields: TField[];
};
type TField = {
  id: string;
  name: string;
  url: string;
  isAuth: boolean;
  username: string;
  password: string;
};
const KafkaConnect: React.FC<PropType> = ({
  handleAddKafkaConnect,
  remove,
  fields,
}) => {
  const [newKafkaConnect, setNewKafkaConnect] = useState(false);
  const methods = useFormContext();
  const connect = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setNewKafkaConnect(!newKafkaConnect);
  };
  const kafka = methods.getValues('kafkaConnect');
  useEffect(() => {
    if (kafka.length < 1) {
      setNewKafkaConnect(false);
      methods.reset({
        ...methods.getValues(),
        kafkaConnect: [
          {
            name: '',
            url: '',
            isAuth: false,
            username: '',
            password: ',',
          },
        ],
      });
    }
  }, [kafka]);
  return (
    <S.Section>
      <S.SectionName>Kafka Connect</S.SectionName>
      <div>
        {newKafkaConnect ? (
          <S.KafkaConnect>
            {fields.map((item, index) => (
              <div key={item.id}>
                <S.InputsContainer>
                  <div>
                    <S.PartStyled>
                      <S.ItemLabelRequired>
                        <label htmlFor="kafkaConnect.name">
                          Kafka Connect name
                        </label>{' '}
                        <S.P>Given name for the Kafka Connect cluster</S.P>
                      </S.ItemLabelRequired>
                      <Input
                        name={`kafkaConnect.${index}.name`}
                        placeholder="Name"
                        aria-label="name"
                        type="text"
                      />
                      <FormError>
                        <ErrorMessage
                          errors={methods.formState.errors}
                          name={`kafkaConnect.${index}.name`}
                        />
                      </FormError>
                    </S.PartStyled>
                    <S.PartStyled>
                      <S.ItemLabelRequired>
                        <label htmlFor="kafkaConnect.url">
                          Kafka Connect URL
                        </label>{' '}
                        <S.P>Address of the Kafka Connect service endpoint</S.P>
                      </S.ItemLabelRequired>
                      <Input
                        name={`kafkaConnect.${index}.url`}
                        placeholder="URl"
                        aria-label="url"
                        type="text"
                      />
                      <FormError>
                        <ErrorMessage
                          errors={methods.formState.errors}
                          name={`kafkaConnect.${index}.url`}
                        />
                      </FormError>
                    </S.PartStyled>
                    <S.PartStyled>
                      <S.CheckboxWrapper>
                        <input
                          {...methods.register(`kafkaConnect.${index}.isAuth`)}
                          id={`kafkaConnect.${index}.isAuth`}
                          name={`kafkaConnect.${index}.isAuth`}
                          type="checkbox"
                        />
                        <label htmlFor={`kafkaConnect.${index}.isAuth`}>
                          Kafka Connect is secured with auth?
                        </label>
                        <FormError>
                          <ErrorMessage
                            errors={methods.formState.errors}
                            name={`kafkaConnect.${index}.isAuth`}
                          />
                        </FormError>
                      </S.CheckboxWrapper>
                    </S.PartStyled>
                    {methods.watch(`kafkaConnect.${index}.isAuth`) && (
                      <>
                        <S.PartStyled>
                          <S.ItemLabelRequired>
                            <label htmlFor={`kafkaConnect.${index}.username`}>
                              Username
                            </label>{' '}
                          </S.ItemLabelRequired>
                          <Input
                            id={`kafkaConnect.${index}.username`}
                            type="text"
                            name={`kafkaConnect.${index}.username`}
                          />
                          <FormError>
                            <ErrorMessage
                              errors={methods.formState.errors}
                              name={`kafkaConnect.${index}.username`}
                            />
                          </FormError>
                        </S.PartStyled>
                        <S.PartStyled>
                          <S.ItemLabelRequired>
                            <label htmlFor={`kafkaConnect.${index}.password`}>
                              Password
                            </label>{' '}
                          </S.ItemLabelRequired>
                          <Input
                            id={`kafkaConnect.${index}.password`}
                            type="password"
                            name={`kafkaConnect.${index}.password`}
                          />
                          <FormError>
                            <ErrorMessage
                              errors={methods.formState.errors}
                              name={`kafkaConnect.${index}.password`}
                            />
                          </FormError>
                        </S.PartStyled>
                      </>
                    )}
                  </div>
                  <S.DeleteButtonWrapper onClick={() => remove(index)}>
                    <IconButtonWrapper aria-label="deleteProperty">
                      <CloseIcon aria-hidden />
                    </IconButtonWrapper>
                  </S.DeleteButtonWrapper>
                </S.InputsContainer>
                <S.Hr />
              </div>
            ))}
            <Button
              type="button"
              buttonSize="M"
              buttonType="secondary"
              onClick={handleAddKafkaConnect}
            >
              <PlusIcon />
              Add Bootstrap Server
            </Button>
          </S.KafkaConnect>
        ) : (
          <Button
            buttonSize="M"
            buttonType="primary"
            onClick={(e) => connect(e)}
          >
            ADD Kafka Connect
          </Button>
        )}
      </div>
    </S.Section>
  );
};
export default KafkaConnect;

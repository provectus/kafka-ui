import React, { useCallback } from 'react';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Button } from 'components/common/Button/Button';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'lib/yupExtended';
import PlusIcon from 'components/common/Icons/PlusIcon';

import * as S from './QueryForm.styled';

export interface Props {
  fetching: boolean;
  hasResults: boolean;
  handleClearResults: () => void;
  handleSSECancel: () => void;
  submitHandler: (values: FormValues) => void;
}
type StreamsPropertiesType = {
  key: string;
  value: string;
};
export type FormValues = {
  ksql: string;
  streamsProperties: StreamsPropertiesType[];
};

const streamsPropertiesSchema = yup.object().shape({
  key: yup.string().trim(),
  value: yup.string().trim(),
});
const validationSchema = yup.object({
  ksql: yup.string().trim().required(),
  streamsProperties: yup.array().of(streamsPropertiesSchema),
});

const QueryForm: React.FC<Props> = ({
  fetching,
  hasResults,
  handleClearResults,
  handleSSECancel,
  submitHandler,
}) => {
  const {
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: [{ key: '', value: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray<
    FormValues,
    'streamsProperties'
  >({
    control,
    name: 'streamsProperties',
  });

  const handleAddNewProperty = useCallback(() => {
    if (
      getValues().streamsProperties.every((prop) => {
        return prop.key;
      })
    ) {
      append({ key: '', value: '' });
    }
  }, []);

  return (
    <S.QueryWrapper>
      <form onSubmit={handleSubmit(submitHandler)}>
        <S.KSQLInputsWrapper>
          <S.Fieldset aria-labelledby="ksqlLabel">
            <S.KSQLInputHeader>
              <label id="ksqlLabel">KSQL</label>
              <Button
                onClick={() => setValue('ksql', '')}
                buttonType="primary"
                buttonSize="S"
                isInverted
              >
                Clear
              </Button>
            </S.KSQLInputHeader>
            <Controller
              control={control}
              name="ksql"
              render={({ field }) => (
                <S.SQLEditor
                  {...field}
                  commands={[
                    {
                      // commands is array of key bindings.
                      // name for the key binding.
                      name: 'commandName',
                      // key combination used for the command.
                      bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
                      // function to execute when keys are pressed.
                      exec: () => {
                        handleSubmit(submitHandler)();
                      },
                    },
                  ]}
                  readOnly={fetching}
                />
              )}
            />
            <FormError>
              <ErrorMessage errors={errors} name="ksql" />
            </FormError>
          </S.Fieldset>

          <S.StreamPropertiesContainer>
            Stream properties:
            {fields.map((item, index) => (
              <S.InputsContainer key={item.id}>
                <S.StreamPropertiesInputWrapper>
                  <Controller
                    control={control}
                    name={`streamsProperties.${index}.key`}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Key"
                        aria-label="key"
                        type="text"
                      />
                    )}
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name={`streamsProperties.${index}.key`}
                    />
                  </FormError>
                </S.StreamPropertiesInputWrapper>
                <S.StreamPropertiesInputWrapper>
                  <Controller
                    control={control}
                    name={`streamsProperties.${index}.value`}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Value"
                        aria-label="value"
                        type="text"
                      />
                    )}
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name={`streamsProperties.${index}.value`}
                    />
                  </FormError>
                </S.StreamPropertiesInputWrapper>

                <S.DeleteButtonWrapper onClick={() => remove(index)}>
                  <IconButtonWrapper aria-label="deleteProperty">
                    <CloseIcon aria-hidden />
                  </IconButtonWrapper>
                </S.DeleteButtonWrapper>
              </S.InputsContainer>
            ))}
            <Button
              type="button"
              buttonSize="M"
              buttonType="secondary"
              onClick={handleAddNewProperty}
            >
              <PlusIcon />
              Add Stream Property
            </Button>
          </S.StreamPropertiesContainer>
        </S.KSQLInputsWrapper>
        <S.KSQLButtons>
          <Button
            buttonType="primary"
            buttonSize="M"
            type="submit"
            disabled={fetching}
          >
            Execute
          </Button>
          <Button
            buttonType="secondary"
            buttonSize="M"
            disabled={!fetching}
            onClick={handleSSECancel}
          >
            Stop query
          </Button>
          <Button
            buttonType="secondary"
            buttonSize="M"
            disabled={fetching || !hasResults}
            onClick={handleClearResults}
          >
            Clear results
          </Button>
        </S.KSQLButtons>
      </form>
    </S.QueryWrapper>
  );
};

export default QueryForm;

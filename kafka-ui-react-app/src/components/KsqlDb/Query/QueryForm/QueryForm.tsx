import React, { useState } from 'react';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useForm, Controller } from 'react-hook-form';
import { Button } from 'components/common/Button/Button';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import CloseIcon from 'components/common/Icons/CloseIcon';
import { assignIn } from 'lodash';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'lib/yupExtended';

import * as S from './QueryForm.styled';

export interface Props {
  fetching: boolean;
  hasResults: boolean;
  handleClearResults: () => void;
  handleSSECancel: () => void;
  submitHandler: (values: FormValues) => void;
}

export type FormValues = {
  ksql: string;
  streamsProperties: string;
};

const validationSchema = yup.object({
  ksql: yup.string().trim(),
  streamsProperties: yup.string().trim(),
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
    control,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onTouched',
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ksql: '',
      streamsProperties: '',
    },
  });

  const [properties, setProperties] = useState([{ id: 0, key: '', value: '' }]);

  const onAddProp = () => {
    const id = properties[properties.length - 1].id + 1;
    setProperties((p) => [...p, { id, key: '', value: '' }]);
  };

  const onDelProp = (i?: number) => {
    setProperties((p) => [...p.filter((item) => item.id !== i)]);
  };

  const setStreamProperties = () => {
    setValue(
      'streamsProperties',
      JSON.stringify(
        properties.reduce((acc, cur) => {
          assignIn(acc, { [cur.key]: cur.value });
          return acc;
        }, {})
      )
    );
  };

  const onKeyChange = (e: React.BaseSyntheticEvent, i: number) => {
    const newArr = [...properties];
    newArr[i].key = e.target.value;
    setProperties(newArr);
    setStreamProperties();
  };

  const onValueChange = (e: React.BaseSyntheticEvent, i: number) => {
    const newArr = [...properties];
    newArr[i].value = e.target.value;
    setProperties(newArr);
    setStreamProperties();
  };

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
            {properties.map((prop, index) => (
              <S.InputsContainer key={prop.id}>
                <Controller
                  control={control}
                  name="streamsProperties"
                  render={() => (
                    <input
                      onChange={(e) => onKeyChange(e, index)}
                      placeholder="Key"
                      aria-label="key"
                      type="text"
                      name="key"
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="streamsProperties"
                  render={() => (
                    <input
                      onChange={(e) => onValueChange(e, index)}
                      placeholder="Value"
                      aria-label="value"
                      type="text"
                      name="value"
                    />
                  )}
                />

                <S.DeleteButtonWrapper
                  key={prop.id}
                  onClick={() => onDelProp(index)}
                >
                  <IconButtonWrapper aria-label="deleteProperty">
                    <CloseIcon aria-hidden />
                  </IconButtonWrapper>
                </S.DeleteButtonWrapper>
              </S.InputsContainer>
            ))}
            <FormError>
              <ErrorMessage errors={errors} name="streamsProperties" />
            </FormError>
            <Button
              type="button"
              buttonSize="M"
              buttonType="secondary"
              onClick={() => onAddProp()}
            >
              <i className="fas fa-plus" />
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

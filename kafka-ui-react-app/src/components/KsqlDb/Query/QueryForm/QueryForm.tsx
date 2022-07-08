import React from 'react';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'lib/yupExtended';
import { useForm, Controller } from 'react-hook-form';
import { Button } from 'components/common/Button/Button';
import { SchemaType } from 'generated-sources';

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
  ksql: yup.string().trim().required(),
  streamsProperties: yup.lazy((value) =>
    value === '' ? yup.string().trim() : yup.string().trim().isJsonObject()
  ),
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
          <S.Fieldset aria-labelledby="streamsPropertiesLabel">
            <S.KSQLInputHeader>
              <label id="streamsPropertiesLabel">
                Stream properties (JSON format)
              </label>
              <Button
                onClick={() => setValue('streamsProperties', '')}
                buttonType="primary"
                buttonSize="S"
                isInverted
              >
                Clear
              </Button>
            </S.KSQLInputHeader>
            <Controller
              control={control}
              name="streamsProperties"
              render={({ field }) => (
                <S.Editor
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
                  schemaType={SchemaType.JSON}
                  readOnly={fetching}
                />
              )}
            />
            <FormError>
              <ErrorMessage errors={errors} name="streamsProperties" />
            </FormError>
          </S.Fieldset>
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

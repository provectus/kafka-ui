import React from 'react';
import { NewSchemaSubjectRaw } from 'redux/interfaces';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { clusterSchemaPath } from 'lib/paths';
import { SchemaType } from 'generated-sources';
import { SCHEMA_NAME_VALIDATION_PATTERN } from 'lib/constants';
import { useHistory, useParams } from 'react-router';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import Select, { SelectOption } from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import { Textarea } from 'components/common/Textbox/Textarea.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import {
  schemaAdded,
  schemasApiClient,
} from 'redux/reducers/schemas/schemasSlice';
import { useAppDispatch } from 'lib/hooks/redux';
import { serverErrorAlertAdded } from 'redux/reducers/alerts/alertsSlice';
import { getResponse } from 'lib/errorHandling';

import * as S from './New.styled';

const SchemaTypeOptions: Array<SelectOption> = [
  { value: SchemaType.AVRO, label: 'AVRO' },
  { value: SchemaType.JSON, label: 'JSON' },
  { value: SchemaType.PROTOBUF, label: 'PROTOBUF' },
];

const New: React.FC = () => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const history = useHistory();
  const dispatch = useAppDispatch();
  const methods = useForm<NewSchemaSubjectRaw>();
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, errors },
  } = methods;

  const onSubmit = React.useCallback(
    async ({ subject, schema, schemaType }: NewSchemaSubjectRaw) => {
      try {
        const resp = await schemasApiClient.createNewSchema({
          clusterName,
          newSchemaSubject: { subject, schema, schemaType },
        });
        dispatch(schemaAdded(resp));
        history.push(clusterSchemaPath(clusterName, subject));
      } catch (e) {
        const err = await getResponse(e as Response);
        dispatch(serverErrorAlertAdded(err));
      }
    },
    [clusterName, dispatch, history]
  );

  return (
    <FormProvider {...methods}>
      <PageHeading text="Create new schema" />
      <S.Form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <InputLabel>Subject *</InputLabel>
          <Input
            inputSize="M"
            placeholder="Schema Name"
            name="subject"
            hookFormOptions={{
              required: 'Schema Name is required.',
              pattern: {
                value: SCHEMA_NAME_VALIDATION_PATTERN,
                message: 'Only alphanumeric, _, -, and . allowed',
              },
            }}
            autoComplete="off"
            disabled={isSubmitting}
          />
          <FormError>
            <ErrorMessage errors={errors} name="subject" />
          </FormError>
        </div>

        <div>
          <InputLabel>Schema *</InputLabel>
          <Textarea
            {...register('schema', {
              required: 'Schema is required.',
            })}
            disabled={isSubmitting}
          />
          <FormError>
            <ErrorMessage errors={errors} name="schema" />
          </FormError>
        </div>

        <div>
          <InputLabel>Schema Type *</InputLabel>
          <Controller
            defaultValue={SchemaTypeOptions[0].value as SchemaType}
            control={control}
            rules={{ required: 'Schema Type is required.' }}
            name="schemaType"
            render={({ field: { name, onChange } }) => (
              <Select
                selectSize="M"
                name={name}
                value={SchemaTypeOptions[0].value}
                onChange={onChange}
                minWidth="50%"
                disabled={isSubmitting}
                options={SchemaTypeOptions}
              />
            )}
          />
          <FormError>
            <ErrorMessage errors={errors} name="schemaType" />
          </FormError>
        </div>

        <Button
          buttonSize="M"
          buttonType="primary"
          type="submit"
          disabled={isSubmitting || !isDirty}
        >
          Submit
        </Button>
      </S.Form>
    </FormProvider>
  );
};

export default New;

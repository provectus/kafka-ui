import React from 'react';
import { NewSchemaSubjectRaw } from 'redux/interfaces';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { ClusterNameRoute, clusterSchemaPath } from 'lib/paths';
import { SchemaType } from 'generated-sources';
import { SCHEMA_NAME_VALIDATION_PATTERN } from 'lib/constants';
import { useNavigate } from 'react-router-dom';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import Select, { SelectOption } from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import { Textarea } from 'components/common/Textbox/Textarea.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { schemaAdded } from 'redux/reducers/schemas/schemasSlice';
import { useAppDispatch } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import { serverErrorAlertAdded } from 'redux/reducers/alerts/alertsSlice';
import { getResponse } from 'lib/errorHandling';
import { schemasApiClient } from 'lib/api';

import * as S from './New.styled';

const SchemaTypeOptions: Array<SelectOption> = [
  { value: SchemaType.AVRO, label: 'AVRO' },
  { value: SchemaType.JSON, label: 'JSON' },
  { value: SchemaType.PROTOBUF, label: 'PROTOBUF' },
];

const New: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const methods = useForm<NewSchemaSubjectRaw>({
    mode: 'onChange',
    defaultValues: {
      schemaType: SchemaType.AVRO,
    },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty, isSubmitting, errors, isValid },
  } = methods;

  const onSubmit = async ({
    subject,
    schema,
    schemaType,
  }: NewSchemaSubjectRaw) => {
    try {
      const resp = await schemasApiClient.createNewSchema({
        clusterName,
        newSchemaSubject: { subject, schema, schemaType },
      });
      dispatch(schemaAdded(resp));
      navigate(clusterSchemaPath(clusterName, subject));
    } catch (e) {
      const err = await getResponse(e as Response);
      dispatch(serverErrorAlertAdded(err));
    }
  };

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
            control={control}
            rules={{ required: 'Schema Type is required.' }}
            name="schemaType"
            render={({ field: { name, onChange, value } }) => (
              <Select
                selectSize="M"
                name={name}
                defaultValue={SchemaTypeOptions[0].value}
                value={value}
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
          disabled={!isValid || isSubmitting || !isDirty}
        >
          Submit
        </Button>
      </S.Form>
    </FormProvider>
  );
};

export default New;

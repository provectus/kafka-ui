import React from 'react';
import { ClusterName, NewSchemaSubjectRaw } from 'redux/interfaces';
import { FormProvider, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { clusterSchemaPath } from 'lib/paths';
import { NewSchemaSubject, SchemaType } from 'generated-sources';
import { SCHEMA_NAME_VALIDATION_PATTERN } from 'lib/constants';
import { useHistory, useParams } from 'react-router';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import styled from 'styled-components';
import { Textarea } from 'components/common/Textbox/Textarea.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';

export interface NewProps {
  createSchema: (
    clusterName: ClusterName,
    newSchemaSubject: NewSchemaSubject
  ) => Promise<void>;
}

const NewSchemaFormStyled = styled.form`
  padding: 16px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  & > button:last-child {
    align-self: flex-start;
  }

  & textarea {
    height: 200px;
  }
  & select {
    width: 30%;
  }
`;

const New: React.FC<NewProps> = ({ createSchema }) => {
  const { clusterName } = useParams<{ clusterName: string }>();
  const history = useHistory();
  const methods = useForm<NewSchemaSubjectRaw>();
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = methods;

  const onSubmit = React.useCallback(
    async ({ subject, schema, schemaType }: NewSchemaSubjectRaw) => {
      try {
        await createSchema(clusterName, {
          subject,
          schema,
          schemaType,
        });
        history.push(clusterSchemaPath(clusterName, subject));
      } catch (e) {
        // Show Error
      }
    },
    [clusterName]
  );

  return (
    <FormProvider {...methods}>
      <PageHeading text="Create new schema" />
      <NewSchemaFormStyled onSubmit={handleSubmit(onSubmit)}>
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
          <Select
            selectSize="M"
            name="schemaType"
            hookFormOptions={{
              required: 'Schema Type is required.',
            }}
            disabled={isSubmitting}
          >
            <option value={SchemaType.AVRO}>AVRO</option>
            <option value={SchemaType.JSON}>JSON</option>
            <option value={SchemaType.PROTOBUF}>PROTOBUF</option>
          </Select>
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
      </NewSchemaFormStyled>
    </FormProvider>
  );
};

export default New;

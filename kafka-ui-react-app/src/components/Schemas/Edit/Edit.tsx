import React from 'react';
import { ClusterSubjectParam } from 'lib/paths';
import yup from 'lib/yupExtended';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaType,
} from 'generated-sources';
import {
  clusterSchemaPath,
  clusterSchemasPath,
  ClusterSubjectParam,
} from 'lib/paths';
import { NewSchemaSubjectRaw } from 'redux/interfaces';
import Editor from 'components/common/Editor/Editor';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import {
  fetchLatestSchema,
  getSchemaLatest,
  SCHEMA_LATEST_FETCH_ACTION,
  getAreSchemaLatestFulfilled,
} from 'redux/reducers/schemas/schemasSlice';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { FormError } from 'components/common/Input/Input.styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { showServerError } from 'lib/errorHandling';
import { resetLoaderById } from 'redux/reducers/loader/loaderSlice';
import { schemasApiClient } from 'lib/api';

import Form from './Form';

const Edit: React.FC = () => {
  const dispatch = useAppDispatch();

  const schema = useAppSelector((state) => getSchemaLatest(state));
  const isFetched = useAppSelector(getAreSchemaLatestFulfilled);

  const validationSchema = () =>
    yup.object().shape({
      newSchema:
        schema?.schemaType === SchemaType.PROTOBUF
          ? yup.string().required()
          : yup.string().required().isJsonObject('Schema syntax is not valid'),
    });

  const { clusterName, subject } = useAppParams<ClusterSubjectParam>();
  const methods = useForm<NewSchemaSubjectRaw>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema()),
  });
  const {
    formState: { isSubmitting, dirtyFields, errors },
    control,
    handleSubmit,
  } = methods;

  React.useEffect(() => {
    dispatch(fetchLatestSchema({ clusterName, subject }));
    return () => {
      dispatch(resetLoaderById(SCHEMA_LATEST_FETCH_ACTION));
    };
  }, [clusterName, dispatch, subject]);

  const formatedSchema = React.useMemo(() => {
    return schema?.schemaType === SchemaType.PROTOBUF
      ? schema?.schema
      : JSON.stringify(JSON.parse(schema?.schema || '{}'), null, '\t');
  }, [schema]);

  const onSubmit = async (props: NewSchemaSubjectRaw) => {
    if (!schema) return;

    try {
      if (dirtyFields.compatibilityLevel) {
        await schemasApiClient.updateSchemaCompatibilityLevel({
          clusterName,
          subject,
          compatibilityLevel: {
            compatibility: props.compatibilityLevel,
          },
        });
        dispatch(
          schemaUpdated({
            ...schema,
            compatibilityLevel: props.compatibilityLevel,
          })
        );
      }
      if (dirtyFields.newSchema || dirtyFields.schemaType) {
        const resp = await schemasApiClient.createNewSchema({
          clusterName,
          newSchemaSubject: {
            ...schema,
            schema: props.newSchema || schema.schema,
            schemaType: props.schemaType || schema.schemaType,
          },
        });
        dispatch(schemaAdded(resp));
      }

      navigate(clusterSchemaPath(clusterName, subject));
    } catch (e) {
      showServerError(e as Response);
    }
  };

  if (!isFetched || !schema) {
    return <PageLoader />;
  }
  return (
    <FormProvider {...methods}>
      <PageHeading
        text="Edit"
        backText="Schema Registry"
        backTo={clusterSchemasPath(clusterName)}
      />
      <S.EditWrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div>
              <InputLabel>Type</InputLabel>
              <Controller
                defaultValue={schema.schemaType}
                control={control}
                rules={{ required: true }}
                name="schemaType"
                render={({ field: { name, onChange } }) => (
                  <Select
                    name={name}
                    value={schema.schemaType}
                    onChange={onChange}
                    minWidth="100%"
                    disabled
                    options={Object.keys(SchemaType).map((type) => ({
                      value: type,
                      label: type,
                    }))}
                  />
                )}
              />
            </div>

            <div>
              <InputLabel>Compatibility level</InputLabel>
              <Controller
                defaultValue={
                  schema.compatibilityLevel as CompatibilityLevelCompatibilityEnum
                }
                control={control}
                name="compatibilityLevel"
                render={({ field: { name, onChange } }) => (
                  <Select
                    name={name}
                    value={schema.compatibilityLevel}
                    onChange={onChange}
                    minWidth="100%"
                    disabled={isSubmitting}
                    options={Object.keys(
                      CompatibilityLevelCompatibilityEnum
                    ).map((level) => ({ value: level, label: level }))}
                  />
                )}
              />
            </div>
          </div>
          <S.EditorsWrapper>
            <div>
              <S.EditorContainer>
                <h4>Latest schema</h4>
                <Editor
                  schemaType={schema?.schemaType}
                  isFixedHeight
                  readOnly
                  height="372px"
                  value={formatedSchema}
                  name="latestSchema"
                  highlightActiveLine={false}
                />
              </S.EditorContainer>
            </div>
            <div>
              <S.EditorContainer>
                <h4>New schema</h4>
                <Controller
                  control={control}
                  name="newSchema"
                  render={({ field: { name, onChange } }) => (
                    <Editor
                      schemaType={schema?.schemaType}
                      readOnly={isSubmitting}
                      defaultValue={formatedSchema}
                      name={name}
                      onChange={onChange}
                    />
                  )}
                />
                <FormError>
                  <ErrorMessage errors={errors} name="newSchema" />
                </FormError>
              </S.EditorContainer>
              <Button
                buttonType="primary"
                buttonSize="M"
                type="submit"
                disabled={!!errors.newSchema}
              >
                Submit
              </Button>
            </div>
          </S.EditorsWrapper>
        </form>
      </S.EditWrapper>
    </FormProvider>
  );
};

export default Edit;

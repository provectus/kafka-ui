import React from 'react';
import { useHistory, useParams } from 'react-router';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaType,
} from 'generated-sources';
import { clusterSchemaPath } from 'lib/paths';
import { NewSchemaSubjectRaw } from 'redux/interfaces';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  schemasApiClient,
  selectSchemaById,
} from 'redux/reducers/schemas/schemasSlice';
import { serverErrorAlertAdded } from 'redux/reducers/alerts/alertsSlice';
import { getResponse } from 'lib/errorHandling';

import * as S from './Edit.styled';

const Edit: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  const { clusterName, subject } =
    useParams<{ clusterName: string; subject: string }>();
  const methods = useForm<NewSchemaSubjectRaw>({ mode: 'onChange' });
  const {
    formState: { isDirty, isSubmitting, dirtyFields },
    control,
    handleSubmit,
  } = methods;

  const schema = useAppSelector((state) => selectSchemaById(state, subject));

  const formatedSchema = React.useMemo(
    () => JSON.stringify(JSON.parse(schema?.schema || '{}'), null, '\t'),
    [schema]
  );

  const onSubmit = React.useCallback(async (props: NewSchemaSubjectRaw) => {
    if (!schema) return;

    try {
      if (dirtyFields.newSchema || dirtyFields.schemaType) {
        await schemasApiClient.createNewSchema({
          clusterName,
          newSchemaSubject: {
            ...schema,
            schema: props.newSchema || schema.schema,
            schemaType: props.schemaType || schema.schemaType,
          },
        });
      }

      if (dirtyFields.compatibilityLevel) {
        await schemasApiClient.updateSchemaCompatibilityLevel({
          clusterName,
          subject,
          compatibilityLevel: {
            compatibility: props.compatibilityLevel,
          },
        });
      }

      history.push(clusterSchemaPath(clusterName, subject));
    } catch (e) {
      const err = await getResponse(e as Response);
      dispatch(serverErrorAlertAdded(err));
    }
  }, []);

  if (!schema) return null;

  return (
    <FormProvider {...methods}>
      <PageHeading text="Edit schema" />
      <S.EditWrapper>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div>
              <InputLabel>Type</InputLabel>
              <Select
                name="schemaType"
                required
                defaultValue={schema.schemaType}
                disabled={isSubmitting}
              >
                {Object.keys(SchemaType).map((type: string) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <InputLabel>Compatibility level</InputLabel>
              <Select
                name="compatibilityLevel"
                defaultValue={schema.compatibilityLevel}
                disabled={isSubmitting}
              >
                {Object.keys(CompatibilityLevelCompatibilityEnum).map(
                  (level: string) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  )
                )}
              </Select>
            </div>
          </div>
          <S.EditorsWrapper>
            <div>
              <S.EditorContainer>
                <h4>Latest schema</h4>
                <JSONEditor
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
                    <JSONEditor
                      readOnly={isSubmitting}
                      defaultValue={formatedSchema}
                      name={name}
                      onChange={onChange}
                    />
                  )}
                />
              </S.EditorContainer>
              <Button
                buttonType="primary"
                buttonSize="M"
                type="submit"
                disabled={!isDirty || isSubmitting}
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

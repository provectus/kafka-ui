import React from 'react';
import { useHistory } from 'react-router';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaSubject,
  SchemaType,
} from 'generated-sources';
import { clusterSchemaPath } from 'lib/paths';
import { ClusterName, NewSchemaSubjectRaw, SchemaName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import Select from 'components/common/Select/Select';
import { Button } from 'components/common/Button/Button';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';

import { EditorsWrapper, EditWrapper } from './Edit.styled';

export interface EditProps {
  subject: SchemaName;
  schema: SchemaSubject;
  clusterName: ClusterName;
  schemasAreFetched: boolean;
  fetchSchemasByClusterName: (clusterName: ClusterName) => void;
  updateSchema: (
    latestSchema: SchemaSubject,
    newSchema: string,
    newSchemaType: SchemaType,
    newCompatibilityLevel: CompatibilityLevelCompatibilityEnum,
    clusterName: string,
    subject: string
  ) => Promise<void>;
}

const Edit = ({
  subject,
  schema,
  clusterName,
  schemasAreFetched,
  fetchSchemasByClusterName,
  updateSchema,
}: EditProps) => {
  React.useEffect(() => {
    if (!schemasAreFetched) fetchSchemasByClusterName(clusterName);
  }, [clusterName, fetchSchemasByClusterName]);

  const methods = useForm<NewSchemaSubjectRaw>({ mode: 'onChange' });

  const getFormattedSchema = React.useCallback(
    () => JSON.stringify(JSON.parse(schema.schema), null, '\t'),
    [schema]
  );
  const history = useHistory();
  const onSubmit = React.useCallback(
    async ({
      schemaType,
      compatibilityLevel,
      newSchema,
    }: {
      schemaType: SchemaType;
      compatibilityLevel: CompatibilityLevelCompatibilityEnum;
      newSchema: string;
    }) => {
      try {
        await updateSchema(
          schema,
          newSchema,
          schemaType,
          compatibilityLevel,
          clusterName,
          subject
        );
        history.push(clusterSchemaPath(clusterName, subject));
      } catch (e) {
        // do not redirect
      }
    },
    [
      schema,
      methods.register,
      methods.control,
      clusterName,
      subject,
      updateSchema,
      history,
    ]
  );

  return (
    <FormProvider {...methods}>
      <PageHeading text="Edit schema" />
      {schemasAreFetched ? (
        <EditWrapper>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div>
              <div>
                <InputLabel>Type</InputLabel>
                <Select
                  name="schemaType"
                  required
                  defaultValue={schema.schemaType}
                  disabled={methods.formState.isSubmitting}
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
                  disabled={methods.formState.isSubmitting}
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
            <EditorsWrapper>
              <div>
                <h4>Latest schema</h4>
                <JSONEditor
                  isFixedHeight
                  readOnly
                  height="372px"
                  value={getFormattedSchema()}
                  name="latestSchema"
                  highlightActiveLine={false}
                />
              </div>
              <div>
                <h4>New schema</h4>
                <Controller
                  control={methods.control}
                  name="newSchema"
                  render={({ field: { name, onChange } }) => (
                    <JSONEditor
                      readOnly={methods.formState.isSubmitting}
                      defaultValue={getFormattedSchema()}
                      name={name}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </EditorsWrapper>
            <Button
              buttonType="primary"
              buttonSize="M"
              type="submit"
              disabled={
                !methods.formState.isDirty || methods.formState.isSubmitting
              }
            >
              Submit
            </Button>
          </form>
        </EditWrapper>
      ) : (
        <PageLoader />
      )}
    </FormProvider>
  );
};

export default Edit;

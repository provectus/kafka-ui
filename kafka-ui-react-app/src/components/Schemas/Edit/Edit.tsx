import React from 'react';
import { useHistory } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaSubject,
  SchemaType,
} from 'generated-sources';
import { clusterSchemaPath, clusterSchemasPath } from 'lib/paths';
import { ClusterName, NewSchemaSubjectRaw, SchemaName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';

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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, isDirty },
    control,
  } = useForm<NewSchemaSubjectRaw>({ mode: 'onChange' });

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
    [schema, register, control, clusterName, subject, updateSchema, history]
  );

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb
            links={[
              {
                href: clusterSchemasPath(clusterName),
                label: 'Schema Registry',
              },
              {
                href: clusterSchemaPath(clusterName, subject),
                label: subject,
              },
            ]}
          >
            Edit
          </Breadcrumb>
        </div>
      </div>

      {schemasAreFetched ? (
        <div className="box">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-3 is-flex-direction-column"
          >
            <div className="mb-4">
              <h5 className="title is-5 mb-2">Schema Type</h5>
              <div className="select">
                <select
                  {...register('schemaType', {
                    required: 'Schema Type is required.',
                  })}
                  defaultValue={schema.schemaType}
                  disabled={isSubmitting}
                >
                  {Object.keys(SchemaType).map((type: string) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="title is-5 mb-2">Compatibility Level</h5>
              <div className="select">
                <select
                  {...register('compatibilityLevel')}
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
                </select>
              </div>
            </div>
            <div className="columns">
              <div className="column is-one-half">
                <h4 className="title is-5 mb-2">Latest Schema</h4>
                <JSONEditor
                  isFixedHeight
                  readOnly
                  height="500px"
                  value={getFormattedSchema()}
                  name="latestSchema"
                  highlightActiveLine={false}
                />
              </div>
              <div className="column is-one-half">
                <h4 className="title is-5 mb-2">New Schema</h4>
                <Controller
                  control={control}
                  name="newSchema"
                  render={({ field: { name, onChange } }) => (
                    <JSONEditor
                      readOnly={isSubmitting}
                      defaultValue={getFormattedSchema()}
                      name={name}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>
            <button
              type="submit"
              className="button is-primary"
              disabled={!isDirty || isSubmitting}
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <PageLoader />
      )}
    </div>
  );
};

export default Edit;

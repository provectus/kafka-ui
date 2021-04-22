import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaSubject,
  SchemaType,
} from 'generated-sources';
import { clusterSchemaPath, clusterSchemasPath } from 'lib/paths';
import React from 'react';
import { ClusterName, NewSchemaSubjectRaw, SchemaName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { useHistory } from 'react-router';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';
import { useForm } from 'react-hook-form';

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
    formState: { isSubmitting },
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
      await updateSchema(
        schema,
        newSchema,
        schemaType,
        compatibilityLevel,
        clusterName,
        subject
      );
      history.push(clusterSchemaPath(clusterName, subject));
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

      {schemasAreFetched && !isSubmitting ? (
        <div className="box">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-3 is-flex-direction-column"
          >
            <div className="mb-4">
              <h5 className="title is-5 mb-2">Schema Type</h5>
              <div className="select">
                <select
                  name="schemaType"
                  ref={register({
                    required: 'Schema Type is required.',
                  })}
                  defaultValue={schema.schemaType}
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
                  name="compatibilityLevel"
                  ref={register()}
                  defaultValue={schema.compatibilityLevel}
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
                  readonly
                  value={getFormattedSchema()}
                  name="latestSchema"
                />
              </div>
              <div className="column is-one-half">
                <h4 className="title is-5 mb-2">New Schema</h4>
                <JSONEditor
                  control={control}
                  value={getFormattedSchema()}
                  name="newSchema"
                />
              </div>
            </div>
            <button type="submit" className="button is-primary">
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

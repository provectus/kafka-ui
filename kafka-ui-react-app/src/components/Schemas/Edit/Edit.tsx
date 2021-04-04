import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import {
  CompatibilityLevelCompatibilityEnum,
  NewSchemaSubject,
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
import { isEqual } from 'lodash';

export interface EditProps {
  subject: SchemaName;
  schema: SchemaSubject;
  clusterName: ClusterName;
  schemasAreFetched: boolean;
  createSchema: (
    clusterName: ClusterName,
    newSchemaSubject: NewSchemaSubject
  ) => Promise<void>;
  fetchSchemasByClusterName: (clusterName: ClusterName) => void;
  updateSchemaCompatibilityLevel: (
    clusterName: ClusterName,
    subject: string,
    compatibilityLevel: CompatibilityLevelCompatibilityEnum
  ) => void;
}

export default function Edit({
  subject,
  schema,
  clusterName,
  schemasAreFetched,
  createSchema,
  fetchSchemasByClusterName,
  updateSchemaCompatibilityLevel,
}: EditProps) {
  React.useEffect(() => {
    if (!schemasAreFetched) fetchSchemasByClusterName(clusterName);
  }, [clusterName, fetchSchemasByClusterName]);

  let newSchema = '';
  let isSubmitting = false;
  const { register, handleSubmit } = useForm<NewSchemaSubjectRaw>();
  const handleSchemaChange = (e: string) => {
    newSchema = e;
  };
  const history = useHistory();
  const onSubmit = async ({
    schemaType,
    compatibilityLevel,
  }: {
    schemaType: SchemaType;
    compatibilityLevel: CompatibilityLevelCompatibilityEnum;
  }) => {
    try {
      isSubmitting = true;
      if (
        (newSchema &&
          !isEqual(JSON.parse(schema.schema), JSON.parse(newSchema))) ||
        schemaType !== schema.schemaType
      ) {
        await createSchema(clusterName, {
          ...schema,
          schema: newSchema || schema.schema,
          schemaType: schemaType || schema.schemaType,
        });
      }
      if (compatibilityLevel !== schema.compatibilityLevel) {
        await updateSchemaCompatibilityLevel(
          clusterName,
          subject,
          compatibilityLevel
        );
      }
      history.push(clusterSchemaPath(clusterName, subject));
    } catch (e) {
      isSubmitting = false;
      // Show Error
    }
  };

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
          <div className="columns">
            <div className="column is-one-half">
              <h4 className="title is-5 mb-2">Latest Schema</h4>
              <JSONEditor
                readonly
                value={JSON.stringify(JSON.parse(schema.schema), null, '\t')}
                name="latestSchema"
              />
            </div>
            <div className="column is-one-half">
              <h4 className="title is-5 mb-2">New Schema</h4>
              <JSONEditor
                value={JSON.stringify(JSON.parse(schema.schema), null, '\t')}
                name="newSchema"
                onChange={(e) => handleSchemaChange(e)}
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-3 is-flex-direction-column"
          >
            <div className="columns">
              <div className="column is-one-half">
                <h5 className="title is-5 mb-2">Schema Type</h5>
                <div className="is-block select">
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

              <div className="column is-one-half">
                <h5 className="title is-5 mb-2">Compatibility Level</h5>
                <div className="select is-block ">
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
}

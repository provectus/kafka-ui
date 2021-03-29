import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { NewSchemaSubject, SchemaSubject } from 'generated-sources';
import { clusterSchemaPath, clusterSchemasPath } from 'lib/paths';
import React from 'react';
import { ClusterName, SchemaName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import { useHistory } from 'react-router';
import JSONEditor from 'components/common/JSONEditor/JSONEditor';

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
}

export default function Edit({
  subject,
  schema,
  clusterName,
  schemasAreFetched,
  createSchema,
  fetchSchemasByClusterName,
}: EditProps) {
  let newSchema = '';

  React.useEffect(() => {
    if (!schemasAreFetched) fetchSchemasByClusterName(clusterName);
  }, [clusterName, fetchSchemasByClusterName]);

  const handleChange = (e: string) => {
    newSchema = e;
  };

  const history = useHistory();
  const onSubmit = async () => {
    try {
      await createSchema(clusterName, {
        ...schema,
        schema: newSchema,
      });
      history.push(clusterSchemaPath(clusterName, subject));
    } catch (e) {
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

      {schemasAreFetched ? (
        <div className="box">
          <div className="is-flex is-justify-content-space-evenly">
            <div>
              <h4 className="title is-5 mb-2">Latest Schema</h4>
              <JSONEditor
                readonly
                value={JSON.stringify(JSON.parse(schema.schema), null, '\t')}
                name="latestSchema"
              />
            </div>
            <div>
              <h4 className="title is-5 mb-2">New Schema</h4>
              <JSONEditor
                value={newSchema}
                name="newSchema"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          <div className="is-flex is-justify-content-center is-align-items-center">
            <button
              type="submit"
              className="button is-primary mt-3"
              onClick={onSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <PageLoader />
      )}
    </div>
  );
}

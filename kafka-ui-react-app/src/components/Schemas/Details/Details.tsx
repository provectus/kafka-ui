import { SchemaSubject } from 'generated-sources';
import React from 'react';
import { ClusterName } from 'redux/interfaces';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';
import DetailsItem from './DetailsItem';
import { clusterSchemasPath } from '../../../lib/paths';

interface DetailsProps {
  schema: SchemaSubject;
  clusterName: ClusterName;
  schemaName: SchemaSubject['subject'];
  versions: string;
  fetchSchemaVersions: (
    clusterName: ClusterName,
    schemaName: SchemaSubject['subject']
  ) => void;
}

const Details: React.FC<DetailsProps> = ({
  schema,
  clusterName,
  versions,
  fetchSchemaVersions,
  schemaName,
}) => {
  React.useEffect(() => {
    fetchSchemaVersions(clusterName, schemaName);
  }, [fetchSchemaVersions, clusterName, schemaName]);

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
            ]}
          >
            {schema.subject}
          </Breadcrumb>
        </div>
      </div>
      <div className="box">
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Latest Version</th>
            </tr>
          </thead>
          <tbody>
            <DetailsItem schema={schema} />
          </tbody>
        </table>
      </div>
      <div className="box">
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Versions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{versions}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Details;

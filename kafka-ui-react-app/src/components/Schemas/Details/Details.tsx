import { SchemaSubject } from 'generated-sources';
import React from 'react';
import { ClusterName } from 'redux/interfaces';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';
import DetailsItem from './DetailsItem';
import { clusterSchemasPath } from '../../../lib/paths';

interface DetailsProps {
  schema: SchemaSubject;
  clusterName: ClusterName;
}

const Details: React.FC<DetailsProps> = ({ schema, clusterName }) => {
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
    </div>
  );
};

export default Details;

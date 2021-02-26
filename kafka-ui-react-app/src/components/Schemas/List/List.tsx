import React from 'react';
import { SchemaSubject } from 'generated-sources';
import { NavLink, useParams } from 'react-router-dom';
import { clusterSchemaNewPath } from 'lib/paths';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import ListItem from './ListItem';

export interface ListProps {
  schemas: SchemaSubject[];
}

const List: React.FC<ListProps> = ({ schemas }) => {
  const { clusterName } = useParams<{ clusterName: string }>();

  return (
    <div className="section">
      <Breadcrumb>Schema Registry</Breadcrumb>
      <div className="box">
        <div className="level">
          <div className="level-item level-right">
            <NavLink
              className="button is-primary"
              to={clusterSchemaNewPath(clusterName)}
            >
              Create Schema
            </NavLink>
          </div>
        </div>
      </div>

      <div className="box">
        <table className="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Schema Name</th>
              <th>Version</th>
              <th>Compatibility</th>
            </tr>
          </thead>
          <tbody>
            {schemas.length > 0 ? (
              schemas.map((subject) => (
                <ListItem key={subject.id} subject={subject} />
              ))
            ) : (
              <tr>
                <td colSpan={10}>No schemas found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;

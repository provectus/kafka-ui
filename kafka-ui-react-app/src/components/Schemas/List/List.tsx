import React from 'react';
import { SchemaSubject } from 'generated-sources';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';
import ListItem from './ListItem';

export interface ListProps {
  schemas: SchemaSubject[];
}

const List: React.FC<ListProps> = ({ schemas }) => {
  return (
    <div className="section">
      <Breadcrumb>Schema Registry</Breadcrumb>
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
            {schemas.map((subject) => (
              <ListItem key={subject.id} subject={subject} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;

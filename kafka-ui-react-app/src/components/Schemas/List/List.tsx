import React from 'react';
import { Schema } from 'redux/interfaces';
import Breadcrumb from '../../common/Breadcrumb/Breadcrumb';
import ListItem from './ListItem';

interface ListProps {
  schemas: Schema[];
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
            </tr>
          </thead>
          <tbody>
            {schemas.map(({ name }) => (
              <ListItem schemaName={name} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;

import React from 'react';
import { useParams } from 'react-router-dom';
import { clusterSchemaNewPath } from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import * as C from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Button } from 'components/common/Button/Button';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { useAppSelector } from 'lib/hooks/redux';
import { selectAllSchemas } from 'redux/reducers/schemas/schemasSlice';

import ListItem from './ListItem';
import GlobalSchemaSelector from './GlobalSchemaSelector/GlobalSchemaSelector';

const List: React.FC = () => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: string }>();
  const schemas = useAppSelector(selectAllSchemas);

  return (
    <>
      <PageHeading text="Schema Registry">
        {!isReadOnly && (
          <>
            <GlobalSchemaSelector />
            <Button
              buttonSize="M"
              buttonType="primary"
              isLink
              to={clusterSchemaNewPath(clusterName)}
            >
              <i className="fas fa-plus" /> Create Schema
            </Button>
          </>
        )}
      </PageHeading>
      <C.Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Schema Name" />
            <TableHeaderCell title="Version" />
            <TableHeaderCell title="Compatibility" />
          </tr>
        </thead>
        <tbody>
          {schemas.length === 0 && (
            <tr>
              <td colSpan={10}>No schemas found</td>
            </tr>
          )}
          {schemas.map((subject) => (
            <ListItem
              key={[subject.id, subject.subject].join('-')}
              subject={subject}
            />
          ))}
        </tbody>
      </C.Table>
    </>
  );
};

export default List;

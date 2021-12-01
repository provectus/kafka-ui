import React from 'react';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaSubject,
} from 'generated-sources';
import { useParams } from 'react-router-dom';
import { clusterSchemaNewPath } from 'lib/paths';
import { ClusterName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ClusterContext from 'components/contexts/ClusterContext';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Button } from 'components/common/Button/Button';
import PageHeading from 'components/common/PageHeading/PageHeading';

import ListItem from './ListItem';
import GlobalSchemaSelector from './GlobalSchemaSelector/GlobalSchemaSelector';

export interface ListProps {
  schemas: SchemaSubject[];
  isFetching: boolean;
  isGlobalSchemaCompatibilityLevelFetched: boolean;
  globalSchemaCompatibilityLevel?: CompatibilityLevelCompatibilityEnum;
  fetchSchemasByClusterName: (clusterName: ClusterName) => void;
  fetchGlobalSchemaCompatibilityLevel: (
    clusterName: ClusterName
  ) => Promise<void>;
  updateGlobalSchemaCompatibilityLevel: (
    clusterName: ClusterName,
    compatibilityLevel: CompatibilityLevelCompatibilityEnum
  ) => Promise<void>;
}

const List: React.FC<ListProps> = ({
  schemas,
  isFetching,
  globalSchemaCompatibilityLevel,
  isGlobalSchemaCompatibilityLevelFetched,
  fetchSchemasByClusterName,
  fetchGlobalSchemaCompatibilityLevel,
  updateGlobalSchemaCompatibilityLevel,
}) => {
  const { isReadOnly } = React.useContext(ClusterContext);
  const { clusterName } = useParams<{ clusterName: string }>();

  React.useEffect(() => {
    fetchSchemasByClusterName(clusterName);
    fetchGlobalSchemaCompatibilityLevel(clusterName);
  }, [fetchSchemasByClusterName, clusterName]);

  return (
    <div>
      <PageHeading text="Schema Registry">
        {!isReadOnly && isGlobalSchemaCompatibilityLevelFetched && (
          <>
            <GlobalSchemaSelector
              globalSchemaCompatibilityLevel={globalSchemaCompatibilityLevel}
              updateGlobalSchemaCompatibilityLevel={
                updateGlobalSchemaCompatibilityLevel
              }
            />
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

      {isFetching ? (
        <PageLoader />
      ) : (
        <div>
          <Table isFullwidth>
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
          </Table>
        </div>
      )}
    </div>
  );
};

export default List;

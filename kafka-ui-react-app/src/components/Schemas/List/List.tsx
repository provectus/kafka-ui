import React from 'react';
import {
  CompatibilityLevelCompatibilityEnum,
  SchemaSubject,
} from 'generated-sources';
import { Link, useParams } from 'react-router-dom';
import { clusterSchemaNewPath } from 'lib/paths';
import { ClusterName } from 'redux/interfaces';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import ClusterContext from 'components/contexts/ClusterContext';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { useForm } from 'react-hook-form';

import ListItem from './ListItem';

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
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();
  const [
    isUpdateCompatibilityConfirmationVisible,
    setUpdateCompatibilityConfirmationVisible,
  ] = React.useState(false);

  React.useEffect(() => {
    fetchSchemasByClusterName(clusterName);
    fetchGlobalSchemaCompatibilityLevel(clusterName);
  }, [fetchSchemasByClusterName, clusterName]);

  const onCompatibilityLevelUpdate = async ({
    compatibilityLevel,
  }: {
    compatibilityLevel: CompatibilityLevelCompatibilityEnum;
  }) => {
    await updateGlobalSchemaCompatibilityLevel(clusterName, compatibilityLevel);
    setUpdateCompatibilityConfirmationVisible(false);
  };

  return (
    <div className="section">
      <Breadcrumb>Schema Registry</Breadcrumb>
      <div className="box">
        <div className="level">
          {!isReadOnly && isGlobalSchemaCompatibilityLevelFetched && (
            <div className="level-item level-right">
              <h5 className="is-5 mr-2">Global Compatibility Level: </h5>
              <div className="select mr-2">
                <select
                  name="compatibilityLevel"
                  defaultValue={globalSchemaCompatibilityLevel}
                  ref={register()}
                  onChange={() =>
                    setUpdateCompatibilityConfirmationVisible(true)
                  }
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
              <Link
                className="button is-primary"
                to={clusterSchemaNewPath(clusterName)}
              >
                Create Schema
              </Link>
              <ConfirmationModal
                isOpen={isUpdateCompatibilityConfirmationVisible}
                onCancel={() =>
                  setUpdateCompatibilityConfirmationVisible(false)
                }
                onConfirm={handleSubmit(onCompatibilityLevelUpdate)}
              >
                {isSubmitting ? (
                  <PageLoader />
                ) : (
                  `Are you sure you want to update the global compatibility level?
                  This may affect the compatibility levels of the schemas.`
                )}
              </ConfirmationModal>
            </div>
          )}
        </div>
      </div>

      {isFetching ? (
        <PageLoader />
      ) : (
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
              {schemas.length === 0 && (
                <tr>
                  <td colSpan={10}>No schemas found</td>
                </tr>
              )}
              {schemas.map((subject) => (
                <ListItem key={subject.id} subject={subject} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List;

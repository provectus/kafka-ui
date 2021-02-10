import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route, useParams } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListContainer from './List/ListContainer';

interface SchemasProps {
  isFetched: boolean;
  fetchSchemasByClusterName: (clusterName: ClusterName) => void;
}

interface ParamTypes {
  clusterName: string;
}

const Schemas: React.FC<SchemasProps> = ({
  isFetched,
  fetchSchemasByClusterName,
}) => {
  const { clusterName } = useParams<ParamTypes>();

  React.useEffect(() => {
    fetchSchemasByClusterName(clusterName);
  }, [fetchSchemasByClusterName, clusterName]);

  if (isFetched) {
    return (
      <Switch>
        <Route
          exact
          path="/ui/clusters/:clusterName/schemas"
          component={ListContainer}
        />
      </Switch>
    );
  }

  return <PageLoader />;
};

export default Schemas;

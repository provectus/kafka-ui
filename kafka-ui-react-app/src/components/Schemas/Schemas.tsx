import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { Switch, Route, useParams } from 'react-router-dom';
import PageLoader from 'components/common/PageLoader/PageLoader';
import ListContainer from './List/ListContainer';
import DetailsContainer from './Details/DetailsContainer';

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
        <Route
          exact
          path="/ui/clusters/:clusterName/schemas/:subject/latest"
          component={DetailsContainer}
        />
      </Switch>
    );
  }

  return <PageLoader />;
};

export default Schemas;

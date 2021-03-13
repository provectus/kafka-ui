import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.scss';
import NavContainer from './Nav/NavContainer';
import PageLoader from './common/PageLoader/PageLoader';
import Dashboard from './Dashboard/Dashboard';
import Cluster from './Cluster/Cluster';

interface AppProps {
  isClusterListFetched: boolean;
  fetchClustersList: () => void;
}

const App: React.FC<AppProps> = ({
  isClusterListFetched,
  fetchClustersList,
}) => {
  React.useEffect(() => {
    fetchClustersList();
  }, [fetchClustersList]);

  return (
    <div className="Layout">
      <nav
        className="navbar is-fixed-top is-white Layout__header"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="navbar-brand">
          <a className="navbar-item title is-5 is-marginless" href="/ui">
            Kafka UI
          </a>
        </div>
      </nav>
      <main className="Layout__container">
        <NavContainer className="Layout__navbar" />
        {isClusterListFetched ? (
          <Switch>
            <Route
              exact
              path={['/', '/ui', '/ui/clusters']}
              component={Dashboard}
            />
            <Route path="/ui/clusters/:clusterName" component={Cluster} />
          </Switch>
        ) : (
          <PageLoader fullHeight />
        )}
      </main>
    </div>
  );
};

export default App;

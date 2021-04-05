import './App.scss';
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { GIT_TAG, GIT_COMMIT } from 'lib/constants';
import { Alerts } from 'redux/interfaces';
import NavContainer from './Nav/NavContainer';
import PageLoader from './common/PageLoader/PageLoader';
import Dashboard from './Dashboard/Dashboard';
import Cluster from './Cluster/Cluster';
import Version from './Version/Version';
import Alert from './Alert/Alert';

export interface AppProps {
  isClusterListFetched?: boolean;
  alerts: Alerts;
  fetchClustersList: () => void;
}

const App: React.FC<AppProps> = ({
  isClusterListFetched,
  alerts,
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
        <div className="navbar-end">
          <div className="navbar-item mr-2">
            <Version tag={GIT_TAG} commit={GIT_COMMIT} />
          </div>
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

      <div className="Layout__alerts">
        {alerts.map(({ id, type, title, message, response, createdAt }) => (
          <Alert
            key={id}
            id={id}
            type={type}
            title={title}
            message={message}
            response={response}
            createdAt={createdAt}
          />
        ))}
      </div>
    </div>
  );
};

export default App;

import React from 'react';
import cx from 'classnames';
import { Cluster } from 'generated-sources';
import { Switch, Route, useLocation } from 'react-router-dom';
import { GIT_TAG, GIT_COMMIT } from 'lib/constants';
import { Alerts } from 'redux/interfaces';
import Nav from 'components/Nav/Nav';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Dashboard from 'components/Dashboard/Dashboard';
import ClusterPage from 'components/Cluster/Cluster';
import Version from 'components/Version/Version';
import Alert from 'components/Alert/Alert';
import 'components/App.scss';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

import Breadcrumb from './common/Breadcrumb/Breadcrumb';

export interface AppProps {
  isClusterListFetched?: boolean;
  alerts: Alerts;
  clusters: Cluster[];
  fetchClustersList: () => void;
}

const App: React.FC<AppProps> = ({
  isClusterListFetched,
  alerts,
  clusters,
  fetchClustersList,
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);

  const onBurgerClick = React.useCallback(
    () => setIsSidebarVisible(!isSidebarVisible),
    [isSidebarVisible]
  );

  const closeSidebar = React.useCallback(() => setIsSidebarVisible(false), []);

  const location = useLocation();

  React.useEffect(() => {
    closeSidebar();
  }, [location]);

  React.useEffect(() => {
    fetchClustersList();
  }, [fetchClustersList]);

  return (
    <ThemeProvider theme={theme}>
      <div
        className={cx('Layout', { 'Layout--sidebarVisible': isSidebarVisible })}
      >
        <nav
          className="navbar is-fixed-top is-white Layout__header"
          role="navigation"
          aria-label="main navigation"
        >
          <div className="navbar-brand">
            <div
              className={cx('navbar-burger', 'ml-0', {
                'is-active': isSidebarVisible,
              })}
              onClick={onBurgerClick}
              onKeyDown={onBurgerClick}
              role="button"
              tabIndex={0}
            >
              <span />
              <span />
              <span />
            </div>

            <a className="navbar-item title is-5 is-marginless" href="/ui">
              UI for Apache Kafka
            </a>

            <div className="navbar-item">
              <Version tag={GIT_TAG} commit={GIT_COMMIT} />
            </div>
          </div>
        </nav>

        <main className="Layout__container">
          <div className="Layout__sidebar has-shadow has-background-white">
            <Nav
              clusters={clusters}
              isClusterListFetched={isClusterListFetched}
            />
          </div>
          <div
            className="Layout__sidebarOverlay is-overlay"
            onClick={closeSidebar}
            onKeyDown={closeSidebar}
            tabIndex={-1}
            aria-hidden="true"
          />
          {isClusterListFetched ? (
            <>
              <Breadcrumb />
              <Switch>
                <Route
                  exact
                  path={['/', '/ui', '/ui/clusters']}
                  component={Dashboard}
                />
                <Route
                  path="/ui/clusters/:clusterName"
                  component={ClusterPage}
                />
              </Switch>
            </>
          ) : (
            <PageLoader />
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
    </ThemeProvider>
  );
};

export default App;

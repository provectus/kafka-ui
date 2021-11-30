import React from 'react';
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
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

import Breadcrumb from './common/Breadcrumb/Breadcrumb';
import * as S from './App.styled';

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

  const classNameVisibility = isSidebarVisible ? 'visible' : '';

  React.useEffect(() => {
    closeSidebar();
  }, [location]);

  React.useEffect(() => {
    fetchClustersList();
  }, [fetchClustersList]);

  return (
    <ThemeProvider theme={theme}>
      <S.Layout>
        <S.Navbar role="navigation" aria-label="main navigation">
          <S.NavbarBrand>
            <S.NavbarBurger
              onClick={onBurgerClick}
              onKeyDown={onBurgerClick}
              role="button"
              tabIndex={0}
            >
              <S.Span role="separator" />
              <S.Span role="separator" />
              <S.Span role="separator" />
            </S.NavbarBurger>

            <S.Hyperlink href="/ui">UI for Apache Kafka</S.Hyperlink>

            <S.NavbarItem>
              <Version tag={GIT_TAG} commit={GIT_COMMIT} />
            </S.NavbarItem>
          </S.NavbarBrand>
        </S.Navbar>

        <S.Container>
          <S.Sidebar className={classNameVisibility}>
            <Nav
              clusters={clusters}
              isClusterListFetched={isClusterListFetched}
            />
          </S.Sidebar>
          <S.Overlay
            className={classNameVisibility}
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
        </S.Container>

        <S.Alerts role="toolbar">
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
        </S.Alerts>
      </S.Layout>
    </ThemeProvider>
  );
};

export default App;

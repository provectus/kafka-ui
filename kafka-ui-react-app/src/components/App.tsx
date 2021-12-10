import React from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { GIT_TAG, GIT_COMMIT } from 'lib/constants';
import Nav from 'components/Nav/Nav';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import Dashboard from 'components/Dashboard/Dashboard';
import ClusterPage from 'components/Cluster/Cluster';
import Version from 'components/Version/Version';
import Alerts from 'components/Alerts/Alerts';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchClusters,
  getClusterList,
  getAreClustersFulfilled,
} from 'redux/reducers/clusters/clustersSlice';

import * as S from './App.styled';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const areClustersFulfilled = useAppSelector(getAreClustersFulfilled);
  const clusters = useAppSelector(getClusterList);
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
    dispatch(fetchClusters());
  }, [fetchClusters]);

  return (
    <ThemeProvider theme={theme}>
      <S.Layout>
        <S.Navbar role="navigation" aria-label="Page Header">
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
          <S.Sidebar aria-label="Sidebar" $visible={isSidebarVisible}>
            <Nav
              clusters={clusters}
              areClustersFulfilled={areClustersFulfilled}
            />
          </S.Sidebar>
          <S.Overlay
            $visible={isSidebarVisible}
            onClick={closeSidebar}
            onKeyDown={closeSidebar}
            tabIndex={-1}
            aria-hidden="true"
            aria-label="Overlay"
          />
          {areClustersFulfilled ? (
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
        <S.AlertsContainer role="toolbar">
          <Alerts />
        </S.AlertsContainer>
      </S.Layout>
    </ThemeProvider>
  );
};

export default App;

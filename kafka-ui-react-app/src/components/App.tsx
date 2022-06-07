import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { GIT_TAG, GIT_COMMIT } from 'lib/constants';
import { clusterPath, getNonExactPath } from 'lib/paths';
import Nav from 'components/Nav/Nav';
import PageLoader from 'components/common/PageLoader/PageLoader';
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
import Logo from './common/Logo/Logo';
import GitIcon from './common/Icons/GitIcon';
import DiscordIcon from './common/Icons/DiscordIcon';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const areClustersFulfilled = useAppSelector(getAreClustersFulfilled);
  const clusters = useAppSelector(getClusterList);
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);

  const onBurgerClick = () => setIsSidebarVisible(!isSidebarVisible);
  const closeSidebar = () => setIsSidebarVisible(false);

  const location = useLocation();

  React.useEffect(() => {
    closeSidebar();
  }, [closeSidebar, location]);

  React.useEffect(() => {
    dispatch(fetchClusters());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <S.Layout>
        <S.Navbar role="navigation" aria-label="Page Header">
          <S.NavbarBrand>
            <S.NavbarBrand>
              <S.NavbarBurger
                onClick={onBurgerClick}
                onKeyDown={onBurgerClick}
                role="button"
                tabIndex={0}
                aria-label="burger"
              >
                <S.Span role="separator" />
                <S.Span role="separator" />
                <S.Span role="separator" />
              </S.NavbarBurger>

              <S.Hyperlink to="/">
                <Logo />
                UI for Apache Kafka
              </S.Hyperlink>

              <S.NavbarItem>
                {GIT_TAG && <Version tag={GIT_TAG} commit={GIT_COMMIT} />}
              </S.NavbarItem>
            </S.NavbarBrand>
            <S.LogoutLink to="/logout">
              <S.LogoutButton buttonType="primary" buttonSize="M">
                Log out
              </S.LogoutButton>
            </S.LogoutLink>
          </S.NavbarBrand>
          <S.NavbarSocial>
            <S.SocialIconWrapper
              onClick={() =>
                window.open('https://github.com/provectus/kafka-ui', 'blank')
              }
              $hoverColor="#2F3639"
              $clickColor="#171A1C"
            >
              <GitIcon />
            </S.SocialIconWrapper>
            <S.SocialIconWrapper
              onClick={() =>
                window.open('https://discord.com/invite/4DWzD7pGE5', 'blank')
              }
              $hoverColor="#858EEA"
              $clickColor="#5B67E3"
            >
              <DiscordIcon />
            </S.SocialIconWrapper>
          </S.NavbarSocial>
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
            <Routes>
              {['/', '/ui', '/ui/clusters'].map((path) => (
                <Route
                  key="Home" // optional: avoid full re-renders on route changes
                  path={path}
                  element={<Dashboard />}
                />
              ))}
              <Route
                path={getNonExactPath(clusterPath())}
                element={<ClusterPage />}
              />
            </Routes>
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

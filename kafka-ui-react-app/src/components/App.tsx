import React, { Suspense, useCallback } from 'react';
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import * as S from './App.styled';
import Logo from './common/Logo/Logo';
import GitIcon from './common/Icons/GitIcon';
import DiscordIcon from './common/Icons/DiscordIcon';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

const App: React.FC = () => {
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const onBurgerClick = () => setIsSidebarVisible(!isSidebarVisible);
  const closeSidebar = useCallback(() => setIsSidebarVisible(false), []);
  const location = useLocation();

  React.useEffect(() => {
    closeSidebar();
  }, [location, closeSidebar]);

  return (
    <QueryClientProvider client={queryClient}>
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
            </S.NavbarBrand>
            <S.NavbarSocial>
              <S.LogoutLink href="/logout">
                <S.LogoutButton buttonType="primary" buttonSize="M">
                  Log out
                </S.LogoutButton>
              </S.LogoutLink>
              <S.SocialLink
                href="https://github.com/provectus/kafka-ui"
                target="_blank"
              >
                <GitIcon />
              </S.SocialLink>
              <S.SocialLink
                href="https://discord.com/invite/4DWzD7pGE5"
                target="_blank"
              >
                <DiscordIcon />
              </S.SocialLink>
            </S.NavbarSocial>
          </S.Navbar>

          <S.Container>
            <S.Sidebar aria-label="Sidebar" $visible={isSidebarVisible}>
              <Suspense fallback={<PageLoader />}>
                <Nav />
              </Suspense>
            </S.Sidebar>
            <S.Overlay
              $visible={isSidebarVisible}
              onClick={closeSidebar}
              onKeyDown={closeSidebar}
              tabIndex={-1}
              aria-hidden="true"
              aria-label="Overlay"
            />
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
          </S.Container>
          <S.AlertsContainer role="toolbar">
            <Alerts />
          </S.AlertsContainer>
        </S.Layout>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

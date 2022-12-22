import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  accessErrorPage,
  clusterPath,
  errorPage,
  getNonExactPath,
} from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Dashboard from 'components/Dashboard/Dashboard';
import ClusterPage from 'components/Cluster/Cluster';
import { ThemeProvider } from 'styled-components';
import { theme, darkTheme } from 'theme/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { showServerError } from 'lib/errorHandling';
import { Toaster } from 'react-hot-toast';
import GlobalCSS from 'components/global.css';
import * as S from 'components/App.styled';

import ConfirmationModal from './common/ConfirmationModal/ConfirmationModal';
import { ConfirmContextProvider } from './contexts/ConfirmContext';
import { GlobalSettingsProvider } from './contexts/GlobalSettingsContext';
import ErrorPage from './ErrorPage/ErrorPage';
import SunIcon from './common/Icons/SunIcon';
import MoonIcon from './common/Icons/MoonIcon';
import AutoIcon from './common/Icons/AutoIcon';

import { UserInfoRolesAccessProvider } from './contexts/UserInfoRolesAccessContext';
import PageContainer from './PageContainer/PageContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
    mutations: {
      onError(error) {
        showServerError(error as Response);
      },
    },
  },
});
const options = [
  {
    label: (
      <>
        <AutoIcon /> Auto theme
      </>
    ),
    value: 'Auto theme',
  },
  {
    label: (
      <>
        <SunIcon /> Light theme
      </>
    ),
    value: 'Light theme',
  },
  {
    label: (
      <>
        <MoonIcon /> Dark theme
      </>
    ),
    value: 'Dark theme',
  },
];

const App: React.FC = () => {
  const matchDark = window.matchMedia('(prefers-color-scheme: dark)');
  const [themeMode, setThemeMode] = React.useState<string | number>();
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);

  React.useLayoutEffect(() => {
    const mode = localStorage.getItem('mode');
    if (mode) {
      setThemeMode(mode);
      if (mode === 'Auto theme') {
        setIsDarkMode(matchDark.matches);
      } else if (mode === 'Light theme') {
        setIsDarkMode(false);
      } else if (mode === 'Dark theme') {
        setIsDarkMode(true);
      }
    } else {
      setThemeMode('Auto theme');
    }
  }, []);

  const onChangeThemeMode = (value: string | number) => {
    setThemeMode(value);
    localStorage.setItem('mode', value as string);
    if (value === 'Light theme') {
      setIsDarkMode(false);
    } else if (value === 'Dark theme') {
      setIsDarkMode(true);
    }
  };

  React.useEffect(() => {
    if (themeMode === 'Auto theme') {
      setIsDarkMode(matchDark.matches);
      matchDark.addListener((e) => {
        setIsDarkMode(e.matches);
      });
    }
  }, [matchDark, themeMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsProvider>
        <ThemeProvider theme={theme}>
          <Suspense fallback={<PageLoader />}>
            <UserInfoRolesAccessProvider>
              <ConfirmContextProvider>
                <GlobalCSS />
                <S.Layout>
                  <PageContainer>
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
                      <Route
                        path={accessErrorPage}
                        element={
                          <ErrorPage status={403} text="Access is Denied" />
                        }
                      />
                      <Route path={errorPage} element={<ErrorPage />} />
                      <Route
                        path="*"
                        element={<Navigate to={errorPage} replace />}
                      />
                    </Routes>
                  </PageContainer>
                  <Toaster position="bottom-right" />
                </S.Layout>
                <ConfirmationModal />
              </ConfirmContextProvider>
            </UserInfoRolesAccessProvider>
          </Suspense>
        </ThemeProvider>
      </GlobalSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;

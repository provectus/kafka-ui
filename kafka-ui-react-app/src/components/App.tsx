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

const App: React.FC = () => {
  const [isDarkMode, setDarkMode] = React.useState<boolean>(false);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsProvider>
        <ThemeProvider theme={isDarkMode ? darkTheme : theme}>
          <Suspense fallback={<PageLoader />}>
            <UserInfoRolesAccessProvider>
              <ConfirmContextProvider>
                <GlobalCSS />
                <S.Layout>
                  <PageContainer setDarkMode={setDarkMode}>
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

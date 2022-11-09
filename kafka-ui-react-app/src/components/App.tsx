import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { clusterPath, getNonExactPath } from 'lib/paths';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Dashboard from 'components/Dashboard/Dashboard';
import ClusterPage from 'components/Cluster/Cluster';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { showServerError } from 'lib/errorHandling';
import { Toaster } from 'react-hot-toast';
import GlobalCSS from 'components/global.css';
import * as S from 'components/App.styled';

import ConfirmationModal from './common/ConfirmationModal/ConfirmationModal';
import { ConfirmContextProvider } from './contexts/ConfirmContext';
import { GlobalSettingsProvider } from './contexts/GlobalSettingsContext';
import { RolesAccessProvider } from './contexts/RolesAccessContext';
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
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSettingsProvider>
        <ThemeProvider theme={theme}>
          <Suspense fallback={<PageLoader />}>
            <RolesAccessProvider>
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
                    </Routes>
                  </PageContainer>
                  <Toaster position="bottom-right" />
                </S.Layout>
                <ConfirmationModal />
              </ConfirmContextProvider>
            </RolesAccessProvider>
          </Suspense>
        </ThemeProvider>
      </GlobalSettingsProvider>
    </QueryClientProvider>
  );
};

export default App;

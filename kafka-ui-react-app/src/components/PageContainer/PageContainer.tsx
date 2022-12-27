import React, { PropsWithChildren, Suspense, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from 'components/NavBar/NavBar';
import * as S from 'components/PageContainer/PageContainer.styled';
import PageLoader from 'components/common/PageLoader/PageLoader';
import Nav from 'components/Nav/Nav';

const PageContainer: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const onBurgerClick = () => setIsSidebarVisible(!isSidebarVisible);
  const closeSidebar = useCallback(() => setIsSidebarVisible(false), []);
  const location = useLocation();

  React.useEffect(() => {
    closeSidebar();
  }, [location, closeSidebar]);

  return (
    <>
      <NavBar onBurgerClick={onBurgerClick} />
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
        {children}
      </S.Container>
    </>
  );
};

export default PageContainer;

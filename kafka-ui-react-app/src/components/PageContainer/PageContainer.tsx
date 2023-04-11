import React, { PropsWithChildren, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from 'components/NavBar/NavBar';
import * as S from 'components/PageContainer/PageContainer.styled';
import Nav from 'components/Nav/Nav';
import useBoolean from 'lib/hooks/useBoolean';
import { clusterNewConfigPath } from 'lib/paths';
import { GlobalSettingsContext } from 'components/contexts/GlobalSettingsContext';
import { useClusters } from 'lib/hooks/api/clusters';

const PageContainer: React.FC<
  PropsWithChildren<{ setDarkMode: (value: boolean) => void }>
> = ({ children, setDarkMode }) => {
  const {
    value: isSidebarVisible,
    toggle,
    setFalse: closeSidebar,
  } = useBoolean(false);
  const clusters = useClusters();
  const appInfo = React.useContext(GlobalSettingsContext);
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    closeSidebar();
  }, [location, closeSidebar]);

  useEffect(() => {
    if (appInfo.hasDynamicConfig && !clusters.data?.length) {
      navigate(clusterNewConfigPath);
    }
  }, [clusters.data, appInfo.hasDynamicConfig]);
  return (
    <>
      <NavBar onBurgerClick={toggle} setDarkMode={setDarkMode} />
      <S.Container>
        <S.Sidebar aria-label="Sidebar" $visible={isSidebarVisible}>
          <Nav />
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

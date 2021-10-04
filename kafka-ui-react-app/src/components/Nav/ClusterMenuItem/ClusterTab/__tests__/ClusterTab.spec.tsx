import { render } from '@testing-library/react';
import ClusterTab, {
  ClusterTabProps,
} from 'components/Nav/ClusterMenuItem/ClusterTab/ClusterTab';
import { ServerStatus } from 'generated-sources';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

describe('ClusterTab component', () => {
  const setupWrapper = (props?: Partial<ClusterTabProps>) => (
    <ThemeProvider theme={theme}>
      <ClusterTab
        status={ServerStatus.ONLINE}
        isOpen
        toggleClusterMenu={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
  describe('when online', () => {
    it('matches the snapshot', () => {
      const component = render(setupWrapper());
      expect(component.baseElement).toMatchSnapshot();
    });
  });

  describe('when offline', () => {
    it('matches the snapshot', () => {
      const component = render(
        setupWrapper({ status: ServerStatus.OFFLINE, isOpen: false })
      );
      expect(component.baseElement).toMatchSnapshot();
    });
  });
});

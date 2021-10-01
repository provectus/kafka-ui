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
        to="/test"
        status={ServerStatus.ONLINE}
        isOpen
        toggleClusterMenu={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
  describe('with default props', () => {
    it('matches the snapshot', () => {
      const component = render(setupWrapper());
      expect(component.baseElement).toMatchSnapshot();
    });
  });
});

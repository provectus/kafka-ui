import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterTab, {
  ClusterTabProps,
} from 'components/Nav/ClusterTab/ClusterTab';
import { ServerStatus } from 'generated-sources';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const testClusterName = 'My-Huge-Cluster';
const toggleClusterMenuMock = jest.fn();

describe('ClusterTab component', () => {
  const setupWrapper = (props?: Partial<ClusterTabProps>) => (
    <ThemeProvider theme={theme}>
      <ClusterTab
        status={ServerStatus.ONLINE}
        isOpen
        title={testClusterName}
        toggleClusterMenu={toggleClusterMenuMock}
        {...props}
      />
    </ThemeProvider>
  );

  it('renders cluster name', () => {
    render(setupWrapper());
    expect(screen.getByText(testClusterName)).toBeInTheDocument();
  });

  it('renders correct status icon for online cluster', () => {
    render(setupWrapper());
    expect(screen.getByText(ServerStatus.ONLINE)).toBeInTheDocument();
  });

  it('renders correct status icon for offline cluster', () => {
    render(setupWrapper({ status: ServerStatus.OFFLINE }));
    expect(screen.getByText(ServerStatus.OFFLINE)).toBeInTheDocument();
  });

  it('handles onClick action', () => {
    const { baseElement } = render(setupWrapper());
    userEvent.click(baseElement);
    waitFor(() => expect(toggleClusterMenuMock).toHaveBeenCalled());
  });
});

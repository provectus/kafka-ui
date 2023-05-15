import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import PageContainer from 'components/PageContainer/PageContainer';
import { useClusters } from 'lib/hooks/api/clusters';
import { Cluster, ServerStatus } from 'generated-sources';

const burgerButtonOptions = { name: 'burger' };

jest.mock('components/Version/Version', () => () => <div>Version</div>);
interface DataType {
  data: Cluster[] | undefined;
}
jest.mock('lib/hooks/api/clusters');
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));
describe('Page Container', () => {
  const renderComponent = (hasDynamicConfig: boolean, data: DataType) => {
    const useClustersMock = useClusters as jest.Mock;
    useClustersMock.mockReturnValue(data);
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
      })),
    });
    render(
      <PageContainer setDarkMode={jest.fn()}>
        <div>child</div>
      </PageContainer>,
      {
        globalSettings: { hasDynamicConfig },
      }
    );
  };

  it('handle burger click correctly', async () => {
    renderComponent(false, { data: undefined });
    const burger = within(screen.getByLabelText('Page Header')).getByRole(
      'button',
      burgerButtonOptions
    );
    const overlay = screen.getByLabelText('Overlay');
    expect(screen.getByLabelText('Sidebar')).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyleRule('visibility: hidden');
    expect(burger).toHaveStyleRule('display: none');
    await userEvent.click(burger);
    expect(overlay).toHaveStyleRule('visibility: visible');
  });

  it('render the inner container', async () => {
    renderComponent(false, { data: undefined });
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  describe('Redirect to the Wizard page', () => {
    it('redirects to new cluster configuration page if there are no clusters and dynamic config is enabled', async () => {
      await renderComponent(true, { data: [] });

      expect(mockedNavigate).toHaveBeenCalled();
    });

    it('should not navigate to new cluster config page when there are clusters', async () => {
      await renderComponent(true, {
        data: [{ name: 'Cluster 1', status: ServerStatus.ONLINE }],
      });

      expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('should not navigate to new cluster config page when there are no clusters and hasDynamicConfig is false', async () => {
      await renderComponent(false, {
        data: [],
      });

      expect(mockedNavigate).not.toHaveBeenCalled();
    });
  });
});

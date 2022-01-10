import React from 'react';
import { screen, within, waitFor } from '@testing-library/react';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import { clustersPayload } from 'redux/reducers/clusters/__test__/fixtures';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

describe('App', () => {
  describe('initial state', () => {
    beforeEach(() => {
      render(<App />, {
        pathname: '/',
      });
    });
    it('shows PageLoader until clusters are fulfilled', () => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
    it('correctly renders header', () => {
      const header = screen.getByLabelText('Page Header');
      expect(header).toBeInTheDocument();
      expect(
        within(header).getByText('UI for Apache Kafka')
      ).toBeInTheDocument();
      expect(within(header).getAllByRole('separator').length).toEqual(3);
      expect(within(header).getByRole('button')).toBeInTheDocument();
    });
    it('handle burger click correctly', () => {
      const header = screen.getByLabelText('Page Header');
      const burger = within(header).getByRole('button');
      const sidebar = screen.getByLabelText('Sidebar');
      const overlay = screen.getByLabelText('Overlay');
      expect(sidebar).toBeInTheDocument();
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveStyleRule('visibility: hidden');
      expect(burger).toHaveStyleRule('display: none');
      userEvent.click(burger);
      expect(overlay).toHaveStyleRule('visibility: visible');
    });
  });

  describe('with clusters list fetched', () => {
    it('shows Cluster list', async () => {
      const mock = fetchMock.getOnce('/api/clusters', clustersPayload);
      render(<App />, {
        pathname: '/',
      });
      await waitFor(() => expect(mock.called()).toBeTruthy());
      const menuContainer = screen.getByLabelText('Sidebar Menu');
      expect(menuContainer).toBeInTheDocument();
      expect(within(menuContainer).getByText('Dashboard')).toBeInTheDocument();
      expect(
        within(menuContainer).getByText(clustersPayload[0].name)
      ).toBeInTheDocument();
      expect(
        within(menuContainer).getByText(clustersPayload[1].name)
      ).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });
});

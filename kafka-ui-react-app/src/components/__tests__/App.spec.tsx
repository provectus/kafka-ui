import React from 'react';
import { screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from 'components/App';
import { render } from 'lib/testHelpers';
import { store } from 'redux/store';
import { fetchClusters } from 'redux/reducers/clusters/clustersSlice';
import { clustersPayload } from 'redux/reducers/clusters/__test__/fixtures';
import userEvent from '@testing-library/user-event';

describe('App', () => {
  beforeEach(() => {
    render(
      <BrowserRouter basename={window.basePath || '/'}>
        <App />
      </BrowserRouter>
    );
  });

  it('shows PageLoader until clusters are fulfilled', () => {
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows Cluster list', () => {
    store.dispatch({
      type: fetchClusters.fulfilled.type,
      payload: clustersPayload,
    });
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

  it('correctly renders header', () => {
    const header = screen.getByLabelText('Page Header');
    expect(header).toBeInTheDocument();

    expect(within(header).getByText('UI for Apache Kafka')).toBeInTheDocument();
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

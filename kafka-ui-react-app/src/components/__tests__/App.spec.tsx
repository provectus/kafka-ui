import React from 'react';
import { screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Alert } from 'redux/interfaces';
import { store } from 'redux/store';
import App, { AppProps } from 'components/App';
import AppContainer from 'components/AppContainer';
import { render } from 'lib/testHelpers';

const fetchClustersList = jest.fn();

describe('App', () => {
  describe('container', () => {
    it('renders view', () => {
      render(
        <Provider store={store}>
          <BrowserRouter basename={window.basePath || '/'}>
            <AppContainer />
          </BrowserRouter>
        </Provider>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
  });
  describe('view', () => {
    const setupComponent = (props: Partial<AppProps> = {}) => (
      <Provider store={store}>
        <BrowserRouter basename={window.basePath || '/'}>
          <App
            isClusterListFetched
            alerts={[]}
            clusters={[]}
            fetchClustersList={fetchClustersList}
            {...props}
          />
        </BrowserRouter>
      </Provider>
    );

    it('handles fetchClustersList', () => {
      render(setupComponent());

      expect(fetchClustersList).toHaveBeenCalledTimes(1);
    });

    it('shows PageLoader when cluster list is fetched', () => {
      render(setupComponent({ isClusterListFetched: true }));

      expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('shows PageLoader when cluster list is not fetched', () => {
      render(setupComponent({ isClusterListFetched: false }));

      expect(screen.getAllByRole('listitem').length).toEqual(1);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('correctly renders alerts', () => {
      const alert: Alert = {
        id: 'alert-id',
        type: 'success',
        title: 'My Custom Title',
        message: 'My Custom Message',
        createdAt: 1234567890,
      };

      render(setupComponent({ alerts: [alert] }));

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toHaveTextContent(alert.title);
    });

    it('correctly renders empty alerts', () => {
      render(setupComponent());

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('correctly renders navbar', () => {
      render(setupComponent());

      expect(screen.getByText('UI for Apache Kafka')).toBeInTheDocument();
      expect(screen.getAllByRole('separator').length).toEqual(3);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('matches snapshot', () => {
      const wrapper = render(setupComponent());

      expect(wrapper).toMatchSnapshot();
    });
  });
});

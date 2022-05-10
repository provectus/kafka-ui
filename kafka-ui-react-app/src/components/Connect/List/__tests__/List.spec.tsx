import React from 'react';
import { connectors } from 'redux/reducers/connect/__test__/fixtures';
import ClusterContext, {
  ContextProps,
  initialValue,
} from 'components/contexts/ClusterContext';
import ListContainer from 'components/Connect/List/ListContainer';
import List, { ListProps } from 'components/Connect/List/List';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('Connectors List', () => {
  describe('Container', () => {
    it('renders view with initial state of storage', () => {
      render(<ListContainer />);
      expect(screen.getByRole('heading')).toHaveTextContent('Connectors');
    });
  });

  describe('View', () => {
    const fetchConnects = jest.fn();
    const fetchConnectors = jest.fn();
    const setConnectorSearch = jest.fn();
    const setupComponent = (
      props: Partial<ListProps> = {},
      contextValue: ContextProps = initialValue
    ) => (
      <ClusterContext.Provider value={contextValue}>
        <List
          areConnectorsFetching
          areConnectsFetching
          connectors={[]}
          connects={[]}
          fetchConnects={fetchConnects}
          fetchConnectors={fetchConnectors}
          search=""
          setConnectorSearch={setConnectorSearch}
          {...props}
        />
      </ClusterContext.Provider>
    );

    it('renders PageLoader', () => {
      render(setupComponent({ areConnectorsFetching: true }));
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('row')).not.toBeInTheDocument();
    });

    it('renders table', () => {
      render(setupComponent({ areConnectorsFetching: false }));
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders connectors list', () => {
      render(
        setupComponent({
          areConnectorsFetching: false,
          connectors,
        })
      );
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('row').length).toEqual(3);
    });

    it('handles fetchConnects and fetchConnectors', () => {
      render(setupComponent());
      expect(fetchConnects).toHaveBeenCalledTimes(1);
      expect(fetchConnectors).toHaveBeenCalledTimes(1);
    });

    it('renders actions if cluster is not readonly', () => {
      render(setupComponent({}, { ...initialValue, isReadOnly: false }));
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    describe('readonly cluster', () => {
      it('does not render actions if cluster is readonly', () => {
        render(setupComponent({}, { ...initialValue, isReadOnly: true }));
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });
});

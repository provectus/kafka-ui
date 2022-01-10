import React from 'react';
import { StaticRouter } from 'react-router';
import ClusterContext from 'components/contexts/ClusterContext';
import List, { ListProps } from 'components/Schemas/List/List';
import { render } from 'lib/testHelpers';
import { screen, within } from '@testing-library/react';

import { schemas } from './fixtures';

describe('List', () => {
  describe('View', () => {
    const pathname = `/ui/clusters/clusterName/schemas`;

    const setupComponent = (props: Partial<ListProps> = {}) =>
      render(
        <StaticRouter location={{ pathname }} context={{}}>
          <List
            isFetching
            fetchSchemasByClusterName={jest.fn()}
            isGlobalSchemaCompatibilityLevelFetched
            fetchGlobalSchemaCompatibilityLevel={jest.fn()}
            updateGlobalSchemaCompatibilityLevel={jest.fn()}
            schemas={[]}
            {...props}
          />
        </StaticRouter>
      );

    describe('Initial state', () => {
      let useEffect: jest.SpyInstance<
        void,
        [effect: React.EffectCallback, deps?: React.DependencyList | undefined]
      >;
      const mockedFn = jest.fn();

      const mockedUseEffect = () => {
        useEffect.mockImplementationOnce(mockedFn);
      };

      beforeEach(() => {
        useEffect = jest.spyOn(React, 'useEffect');
        mockedUseEffect();
      });

      it('should call fetchSchemasByClusterName every render', () => {
        setupComponent({ fetchSchemasByClusterName: mockedFn });
        expect(mockedFn).toHaveBeenCalled();
      });
    });

    describe('when fetching', () => {
      it('renders PageLoader', () => {
        setupComponent({ isFetching: true });
        expect(screen.queryByRole('rowgroup')).not.toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    describe('without schemas', () => {
      it('renders table heading with 3 columns', () => {
        setupComponent({ isFetching: false });
        const rowGroups = screen.getAllByRole('rowgroup');
        expect(rowGroups.length).toEqual(2);
        const theadRows = within(rowGroups[0]).getAllByRole('row');
        expect(theadRows.length).toEqual(1);
        expect(
          within(theadRows[0]).getAllByRole('columnheader').length
        ).toEqual(3);
        expect(
          within(rowGroups[1]).getByText('No schemas found')
        ).toBeInTheDocument();
      });
    });

    describe('with schemas', () => {
      it('renders table heading with ListItem', () => {
        setupComponent({ isFetching: false, schemas });
        const rowGroups = screen.getAllByRole('rowgroup');
        expect(within(rowGroups[1]).getAllByRole('row').length).toEqual(3);
      });
    });

    describe('with readonly cluster', () => {
      const setupReadonlyComponent = (props: Partial<ListProps> = {}) =>
        render(
          <StaticRouter>
            <ClusterContext.Provider
              value={{
                isReadOnly: true,
                hasKafkaConnectConfigured: true,
                hasSchemaRegistryConfigured: true,
                isTopicDeletionAllowed: true,
              }}
            >
              <StaticRouter location={{ pathname }} context={{}}>
                <List
                  isFetching
                  fetchSchemasByClusterName={jest.fn()}
                  isGlobalSchemaCompatibilityLevelFetched
                  fetchGlobalSchemaCompatibilityLevel={jest.fn()}
                  updateGlobalSchemaCompatibilityLevel={jest.fn()}
                  schemas={[]}
                  {...props}
                />
              </StaticRouter>
            </ClusterContext.Provider>
          </StaticRouter>
        );

      it('does not render Create Schema button', () => {
        setupReadonlyComponent();
        expect(screen.queryByText('Create Schema')).not.toBeInTheDocument();
      });
    });
  });
});

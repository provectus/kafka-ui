import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { store } from 'redux/store';
import { StaticRouter } from 'react-router';
import ClusterContext from 'components/contexts/ClusterContext';
import DetailsContainer from 'components/Schemas/Details/DetailsContainer';
import Details, { DetailsProps } from 'components/Schemas/Details/Details';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

import { jsonSchema, versions } from './fixtures';

const clusterName = 'testCluster';
const fetchSchemaVersionsMock = jest.fn();

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

describe('Details', () => {
  describe('Container', () => {
    it('renders view', () => {
      const wrapper = mount(
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <StaticRouter>
              <DetailsContainer />
            </StaticRouter>
          </Provider>
        </ThemeProvider>
      );

      expect(wrapper.exists(Details)).toBeTruthy();
    });
  });

  describe('View', () => {
    const setupWrapper = (props: Partial<DetailsProps> = {}) => (
      <ThemeProvider theme={theme}>
        <StaticRouter>
          <Details
            subject={jsonSchema.subject}
            schema={jsonSchema}
            clusterName={clusterName}
            fetchSchemaVersions={fetchSchemaVersionsMock}
            deleteSchema={jest.fn()}
            fetchSchemasByClusterName={jest.fn()}
            areSchemasFetched
            areVersionsFetched
            versions={[]}
            {...props}
          />
        </StaticRouter>
      </ThemeProvider>
    );
    describe('empty table', () => {
      it('render empty table', () => {
        const component = mount(setupWrapper());
        expect(component.find('td').text()).toEqual('No active Schema');
      });
    });

    describe('Initial state', () => {
      it('should call fetchSchemaVersions every render', () => {
        mount(
          <StaticRouter>
            {setupWrapper({ fetchSchemaVersions: fetchSchemaVersionsMock })}
          </StaticRouter>
        );

        expect(fetchSchemaVersionsMock).toHaveBeenCalledWith(
          clusterName,
          jsonSchema.subject
        );
      });
    });

    describe('when page with schema versions is loading', () => {
      const wrapper = mount(setupWrapper({ areVersionsFetched: false }));

      it('renders PageLoader', () => {
        expect(wrapper.exists('PageLoader')).toBeTruthy();
      });
    });

    describe('when page with schema versions loaded', () => {
      describe('when versions are empty', () => {
        it('renders table heading without SchemaVersion', () => {
          const wrapper = mount(setupWrapper());
          expect(wrapper.exists('LatestVersionItem')).toBeTruthy();
          expect(wrapper.exists('button')).toBeTruthy();
          expect(wrapper.exists('thead')).toBeTruthy();
          expect(wrapper.exists('SchemaVersion')).toBeFalsy();
        });
      });

      describe('when schema has versions', () => {
        it('renders table heading with SchemaVersion', () => {
          const wrapper = mount(setupWrapper({ versions }));
          expect(wrapper.exists('LatestVersionItem')).toBeTruthy();
          expect(wrapper.exists('button')).toBeTruthy();
          expect(wrapper.exists('thead')).toBeTruthy();
          expect(wrapper.find('SchemaVersion').length).toEqual(3);
        });
      });

      describe('when the readonly flag is set', () => {
        it('does not render update & delete buttons', () => {
          expect(
            mount(
              <StaticRouter>
                <ClusterContext.Provider
                  value={{
                    isReadOnly: true,
                    hasKafkaConnectConfigured: true,
                    hasSchemaRegistryConfigured: true,
                    isTopicDeletionAllowed: true,
                  }}
                >
                  {setupWrapper({ versions })}
                </ClusterContext.Provider>
              </StaticRouter>
            ).exists('.level-right')
          ).toBeFalsy();
        });
      });
    });

    describe('when page with schemas are loading', () => {
      const wrapper = mount(setupWrapper({ areSchemasFetched: false }));

      it('renders PageLoader', () => {
        expect(wrapper.exists('PageLoader')).toBeTruthy();
      });
    });
  });
});

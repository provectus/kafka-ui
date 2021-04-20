import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux/store/configureStore';
import { StaticRouter } from 'react-router';
import ClusterContext from 'components/contexts/ClusterContext';
import DetailsContainer from '../DetailsContainer';
import Details, { DetailsProps } from '../Details';
import { schema, versions } from './fixtures';

const clusterName = 'testCluster';
const fetchSchemaVersionsMock = jest.fn();

jest.mock(
  'components/common/ConfirmationModal/ConfirmationModal',
  () => 'mock-ConfirmationModal'
);

describe('Details', () => {
  describe('Container', () => {
    const store = configureStore();

    it('renders view', () => {
      const wrapper = mount(
        <Provider store={store}>
          <StaticRouter>
            <DetailsContainer />
          </StaticRouter>
        </Provider>
      );

      expect(wrapper.exists(Details)).toBeTruthy();
    });
  });

  describe('View', () => {
    const setupWrapper = (props: Partial<DetailsProps> = {}) => (
      <Details
        subject={schema.subject}
        schema={schema}
        clusterName={clusterName}
        fetchSchemaVersions={fetchSchemaVersionsMock}
        deleteSchema={jest.fn()}
        isFetched
        versions={[]}
        {...props}
      />
    );
    describe('Initial state', () => {
      it('should call fetchSchemaVersions every render', () => {
        mount(
          <StaticRouter>
            {setupWrapper({ fetchSchemaVersions: fetchSchemaVersionsMock })}
          </StaticRouter>
        );

        expect(fetchSchemaVersionsMock).toHaveBeenCalledWith(
          clusterName,
          schema.subject
        );
      });

      it('matches snapshot', () => {
        expect(
          shallow(
            setupWrapper({ fetchSchemaVersions: fetchSchemaVersionsMock })
          )
        ).toMatchSnapshot();
      });
    });

    describe('when page with schema versions is loading', () => {
      const wrapper = shallow(setupWrapper({ isFetched: false }));

      it('renders PageLoader', () => {
        expect(wrapper.exists('PageLoader')).toBeTruthy();
      });

      it('matches snapshot', () => {
        expect(shallow(setupWrapper({ isFetched: false }))).toMatchSnapshot();
      });
    });

    describe('when page with schema versions loaded', () => {
      describe('when versions are empty', () => {
        it('renders table heading without SchemaVersion', () => {
          const wrapper = shallow(setupWrapper());
          expect(wrapper.exists('LatestVersionItem')).toBeTruthy();
          expect(wrapper.exists('button')).toBeTruthy();
          expect(wrapper.exists('thead')).toBeTruthy();
          expect(wrapper.exists('SchemaVersion')).toBeFalsy();
        });

        it('matches snapshot', () => {
          expect(shallow(setupWrapper())).toMatchSnapshot();
        });
      });

      describe('when schema has versions', () => {
        it('renders table heading with SchemaVersion', () => {
          const wrapper = shallow(setupWrapper({ versions }));
          expect(wrapper.exists('LatestVersionItem')).toBeTruthy();
          expect(wrapper.exists('button')).toBeTruthy();
          expect(wrapper.exists('thead')).toBeTruthy();
          expect(wrapper.find('SchemaVersion').length).toEqual(2);
        });

        it('calls deleteSchema after confirmation', () => {
          const mockDelete = jest.fn();
          const wrapper = mount(
            <StaticRouter>
              {setupWrapper({ versions, deleteSchema: mockDelete })}
            </StaticRouter>
          );
          expect(
            wrapper.find('mock-ConfirmationModal').prop('isOpen')
          ).toBeFalsy();

          wrapper.find('button').at(1).simulate('click');
          expect(
            wrapper.find('mock-ConfirmationModal').prop('isOpen')
          ).toBeTruthy();

          wrapper
            .find('mock-ConfirmationModal')
            .prop<() => void>('onConfirm')();

          expect(mockDelete).toHaveBeenCalledTimes(1);
        });

        it('matches snapshot', () => {
          expect(shallow(setupWrapper({ versions }))).toMatchSnapshot();
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
  });
});

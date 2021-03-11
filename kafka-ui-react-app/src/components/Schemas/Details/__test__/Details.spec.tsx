import React from 'react';
import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import configureStore from 'redux/store/configureStore';
import { StaticRouter } from 'react-router';
import ClusterContext from 'components/contexts/ClusterContext';
import DetailsContainer from '../DetailsContainer';
import Details, { DetailsProps } from '../Details';
import { schema, versions } from './fixtures';

describe('Details', () => {
  describe('Container', () => {
    const store = configureStore();

    it('renders view', () => {
      const component = shallow(
        <Provider store={store}>
          <DetailsContainer />
        </Provider>
      );

      expect(component.exists()).toBeTruthy();
    });
  });

  describe('View', () => {
    const setupWrapper = (props: Partial<DetailsProps> = {}) => (
      <Details
        subject={schema.subject}
        schema={schema}
        clusterName="Test cluster"
        fetchSchemaVersions={jest.fn()}
        isFetched
        versions={[]}
        {...props}
      />
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
        shallow(setupWrapper({ fetchSchemaVersions: mockedFn }));
      });

      it('should call fetchSchemaVersions every render', () => {
        expect(mockedFn).toHaveBeenCalled();
      });

      it('matches snapshot', () => {
        expect(
          shallow(setupWrapper({ fetchSchemaVersions: mockedFn }))
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
        const wrapper = shallow(setupWrapper({ versions }));

        it('renders table heading with SchemaVersion', () => {
          expect(wrapper.exists('LatestVersionItem')).toBeTruthy();
          expect(wrapper.exists('button')).toBeTruthy();
          expect(wrapper.exists('thead')).toBeTruthy();
          expect(wrapper.find('SchemaVersion').length).toEqual(2);
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
                <ClusterContext.Provider value={{ isReadOnly: true }}>
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

import React from 'react';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import configureStore from 'redux/store/configureStore';
import { StaticRouter } from 'react-router-dom';
import { match } from 'react-router';
import { ClusterName } from 'redux/interfaces';
import Schemas, { SchemasProps } from '../Schemas';
import SchemasContainer from '../SchemasContainer';

describe('Schemas', () => {
  const pathname = `/ui/clusters/clusterName/schemas`;

  describe('Container', () => {
    const store = configureStore();

    it('renders view', () => {
      const component = shallow(
        <Provider store={store}>
          <StaticRouter location={{ pathname }} context={{}}>
            <SchemasContainer />
          </StaticRouter>
        </Provider>
      );

      expect(component.exists()).toBeTruthy();
    });

    describe('View', () => {
      const setupWrapper = (props: Partial<SchemasProps> = {}) => (
        <Schemas
          isFetched
          clusterName="Test"
          fetchSchemasByClusterName={jest.fn()}
          {...props}
        />
      );
      describe('Initial state', () => {
        let useEffect: jest.SpyInstance<
          void,
          [
            effect: React.EffectCallback,
            deps?: React.DependencyList | undefined
          ]
        >;
        let wrapper;
        const mockedFn = jest.fn();

        const mockedUseEffect = () => {
          useEffect.mockImplementationOnce(mockedFn);
        };

        beforeEach(() => {
          useEffect = jest.spyOn(React, 'useEffect');
          mockedUseEffect();

          wrapper = shallow(
            setupWrapper({ fetchSchemasByClusterName: mockedFn })
          );
        });

        it('should call fetchSchemasByClusterName every render', () => {
          expect(mockedFn).toHaveBeenCalled();
        });

        it('matches snapshot', () => {
          expect(
            shallow(setupWrapper({ fetchSchemasByClusterName: mockedFn }))
          ).toMatchSnapshot();
        });
      });

      describe('when page is loading', () => {
        const wrapper = shallow(setupWrapper({ isFetched: false }));

        it('renders PageLoader', () => {
          expect(wrapper.exists('PageLoader')).toBeTruthy();
        });

        it('matches snapshot', () => {
          expect(shallow(setupWrapper({ isFetched: false }))).toMatchSnapshot();
        });
      });
    });
  });
});

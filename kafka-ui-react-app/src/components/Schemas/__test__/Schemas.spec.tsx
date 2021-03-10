import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import configureStore from 'redux/store/configureStore';
import { StaticRouter } from 'react-router-dom';
import Schemas, { SchemasProps } from '../Schemas';
import SchemasContainer from '../SchemasContainer';

describe('Schemas', () => {
  const pathname = `/ui/clusters/clusterName/schemas`;

  describe('Container', () => {
    const store = configureStore();

    it('renders view', () => {
      const component = mount(
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
        <StaticRouter location={{ pathname }} context={{}}>
          <Schemas
            isFetching
            fetchSchemasByClusterName={jest.fn()}
            isReadOnly={false}
            {...props}
          />
        </StaticRouter>
      );
      describe('Initial state', () => {
        let useEffect: jest.SpyInstance<
          void,
          [
            effect: React.EffectCallback,
            deps?: React.DependencyList | undefined
          ]
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
          mount(setupWrapper({ fetchSchemasByClusterName: mockedFn }));
          expect(mockedFn).toHaveBeenCalled();
        });
      });

      describe('when page is loading', () => {
        const wrapper = mount(setupWrapper({ isFetching: true }));

        it('renders PageLoader', () => {
          expect(wrapper.exists('PageLoader')).toBeTruthy();
        });
      });
    });
  });
});

import React from 'react';
import configureStore from 'redux/store/configureStore';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import NewContainer from 'components/Schemas/New/NewContainer';
import New, { NewProps } from 'components/Schemas/New/New';

describe('New', () => {
  describe('Container', () => {
    const store = configureStore();

    it('renders view', () => {
      const component = shallow(
        <Provider store={store}>
          <NewContainer />
        </Provider>
      );

      expect(component.exists()).toBeTruthy();
    });
  });

  describe('View', () => {
    const pathname = '/ui/clusters/clusterName/schemas/create_new';

    const setupWrapper = (props: Partial<NewProps> = {}) => (
      <StaticRouter location={{ pathname }} context={{}}>
        <New createSchema={jest.fn()} {...props} />
      </StaticRouter>
    );

    it('matches snapshot', () => {
      expect(mount(setupWrapper())).toMatchSnapshot();
    });
  });
});

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import configureStore from 'redux/store/configureStore';
import MessagesContainer from 'components/Topics/Topic/Details/Messages/MessagesContainer';

const store = configureStore();

jest.mock(
  'components/Topics/Topic/Details/Messages/Messages',
  () => 'mock-Messages'
);

describe('MessagesContainer', () => {
  it('renders view with initial state of storage', () => {
    const wrapper = mount(
      <Provider store={store}>
        <StaticRouter>
          <MessagesContainer />
        </StaticRouter>
      </Provider>
    );

    expect(wrapper.exists('mock-Messages')).toBeTruthy();
  });
});

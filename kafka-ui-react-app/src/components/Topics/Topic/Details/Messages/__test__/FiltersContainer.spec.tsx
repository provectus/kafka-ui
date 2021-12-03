import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { store } from 'redux/store';
import FiltersContainer from 'components/Topics/Topic/Details/Messages/Filters/FiltersContainer';

jest.mock(
  'components/Topics/Topic/Details/Messages/Filters/Filters',
  () => 'mock-Filters'
);

describe('FiltersContainer', () => {
  it('renders view with initial state of storage', () => {
    const wrapper = mount(
      <Provider store={store}>
        <StaticRouter>
          <FiltersContainer />
        </StaticRouter>
      </Provider>
    );

    expect(wrapper.exists('mock-Filters')).toBeTruthy();
  });
});

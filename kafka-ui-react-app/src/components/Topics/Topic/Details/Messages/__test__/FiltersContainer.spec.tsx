import React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import { store } from 'redux/store';
import FiltersContainer from 'components/Topics/Topic/Details/Messages/Filters/FiltersContainer';
import { render } from '@testing-library/react';

jest.mock(
  'components/Topics/Topic/Details/Messages/Filters/Filters',
  () => 'mock-Filters'
);

describe('FiltersContainer', () => {
  it('renders view with initial state of storage', () => {
    const { container } = render(
      <Provider store={store}>
        <StaticRouter>
          <FiltersContainer />
        </StaticRouter>
      </Provider>
    );
    expect(container.innerHTML.toString().indexOf('mock-filters')).toBeTruthy();
  });
});

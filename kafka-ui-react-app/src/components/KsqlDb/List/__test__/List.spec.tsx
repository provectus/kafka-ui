import React from 'react';
import List from 'components/KsqlDb/List/List';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { RootState } from 'redux/interfaces';

const emptyPlaceholder = 'No tables or streams found';

const mockStore = configureStore();

describe('KsqlDb List', () => {
  const pathname = `ui/clusters/local/ksql-db`;

  it('Renders placeholder on empty data', () => {
    const initialState: Partial<RootState> = {
      ksqlDb: {
        tables: [],
        streams: [],
      },
      loader: {
        GET_KSQL_DB_TABLES_AND_STREAMS: 'fetched',
      },
    };
    const store = mockStore(initialState);

    const component = mount(
      <StaticRouter location={{ pathname }} context={{}}>
        <Provider store={store}>
          <List />
        </Provider>
      </StaticRouter>
    );

    expect(
      component.find({ children: emptyPlaceholder }).exists()
    ).toBeTruthy();
  });
});

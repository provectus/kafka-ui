import React from 'react';
import List from 'components/KsqlDb/List/List';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { fetchKsqlDbTablesPayload } from 'redux/reducers/ksqlDb/__test__/fixtures';

const emptyPlaceholder = 'No tables or streams found';

const mockStore = configureStore();

describe('KsqlDb List', () => {
  const pathname = `ui/clusters/local/ksql-db`;

  it('Renders placeholder on empty data', () => {
    const initialState: Partial<RootState> = {
      ksqlDb: {
        tables: [],
        streams: [],
        executionResult: null,
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

  it('Renders rows', () => {
    const initialState: Partial<RootState> = {
      ksqlDb: { ...fetchKsqlDbTablesPayload, executionResult: null },
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

    // 2 streams, 2 tables and 1 head tr
    expect(component.find('tr').length).toEqual(5);
  });
});

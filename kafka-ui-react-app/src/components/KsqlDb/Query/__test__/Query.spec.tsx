import React from 'react';
import { mount } from 'enzyme';
import Query from 'components/KsqlDb/Query/Query';
import { StaticRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import { RootState } from 'redux/interfaces';
import { ksqlCommandResponse } from 'redux/reducers/ksqlDb/__test__/fixtures';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

const mockStore = configureStore();

describe('KsqlDb Query Component', () => {
  const pathname = `ui/clusters/local/ksql-db/query`;

  it('Renders result', () => {
    const initialState: Partial<RootState> = {
      ksqlDb: {
        streams: [],
        tables: [],
        executionResult: ksqlCommandResponse,
      },
      loader: {
        'ksqlDb/executeKsql': 'fulfilled',
      },
    };
    const store = mockStore(initialState);

    const component = mount(
      <ThemeProvider theme={theme}>
        <StaticRouter location={{ pathname }} context={{}}>
          <Provider store={store}>
            <Query />
          </Provider>
        </StaticRouter>
      </ThemeProvider>
    );

    // 2 streams and 1 head tr
    expect(component.find('tr').length).toEqual(3);
  });

  it('Renders result message', () => {
    const initialState: Partial<RootState> = {
      ksqlDb: {
        streams: [],
        tables: [],
        executionResult: {
          message: 'No available data',
        },
      },
      loader: {
        'ksqlDb/executeKsql': 'fulfilled',
      },
    };
    const store = mockStore(initialState);

    const component = mount(
      <ThemeProvider theme={theme}>
        <StaticRouter location={{ pathname }} context={{}}>
          <Provider store={store}>
            <Query />
          </Provider>
        </StaticRouter>
      </ThemeProvider>
    );

    expect(
      component.find({ children: 'No available data' }).exists()
    ).toBeTruthy();
  });
});

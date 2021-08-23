import React from 'react';
import { mount } from 'enzyme';
import New from 'components/Topics/New/New';
import { StaticRouter } from 'react-router';
import { clusterTopicNewPath } from 'lib/paths';
import configureStore from 'redux-mock-store';
import { RootState } from 'redux/interfaces';
import { Provider } from 'react-redux';

const mockStore = configureStore();

describe('New', () => {
  const clusterName = 'local';

  const initialState: Partial<RootState> = {};
  const store = mockStore(initialState);

  it('matches snapshot', () => {
    expect(
      mount(
        <StaticRouter location={{ pathname: clusterTopicNewPath(clusterName) }}>
          <Provider store={store}>
            <New />
          </Provider>
        </StaticRouter>
      )
    ).toMatchSnapshot();
  });
});

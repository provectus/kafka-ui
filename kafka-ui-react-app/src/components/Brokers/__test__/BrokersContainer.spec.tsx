import React from 'react';
import { containerRendersView } from 'lib/testHelpers';
import Brokers from 'components/Brokers/Brokers';
import configureStore from 'redux/store/configureStore';
import BrokersContainer from 'components/Brokers/BrokersContainer';
import { shallow } from 'enzyme';
import { Provider } from 'react-redux';

describe('BrokersContainer', () => {
  containerRendersView(<BrokersContainer />, Brokers);

  const store = configureStore();
  it('renders view', () => {
    const component = shallow(
      <Provider store={store}>
        <BrokersContainer />
      </Provider>
    );

    expect(component.exists()).toBeTruthy();
  });
});

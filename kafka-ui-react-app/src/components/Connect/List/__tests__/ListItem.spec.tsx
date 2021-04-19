import React from 'react';
import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
import { connectorsPayload } from 'redux/reducers/connect/__test__/fixtures';

import ListItem, { ListItemProps } from '../ListItem';

describe('Connectors ListItem', () => {
  const connector = connectorsPayload[0];
  const setupWrapper = (props: Partial<ListItemProps> = {}) => (
    <BrowserRouter>
      <table>
        <tbody>
          <ListItem clusterName="local" connector={connector} {...props} />
        </tbody>
      </table>
    </BrowserRouter>
  );

  it('renders item', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper.exists(ListItem)).toBeTruthy();
    expect(wrapper.find('td').at(6).find('.has-text-success').text()).toEqual(
      '2 of 2'
    );
  });

  it('matches snapshot', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render info about tasks if taksCount is undefined', () => {
    const wrapper = mount(
      setupWrapper({
        connector: {
          ...connector,
          tasksCount: undefined,
        },
      })
    );
    expect(wrapper.find('td').at(6).text()).toEqual('');
  });
});

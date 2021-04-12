import React from 'react';
import { shallow } from 'enzyme';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import Nav from '../Nav';

describe('Nav', () => {
  it('renders loader', () => {
    const wrapper = shallow(<Nav clusters={[]} />);
    expect(wrapper.find('.loader')).toBeTruthy();
    expect(wrapper.exists('ClusterMenu')).toBeFalsy();
  });

  it('renders ClusterMenu', () => {
    const wrapper = shallow(
      <Nav clusters={[onlineClusterPayload]} isClusterListFetched />
    );
    expect(wrapper.exists('.loader')).toBeFalsy();
    expect(wrapper.exists('ClusterMenu')).toBeTruthy();
    expect(wrapper).toMatchSnapshot();
  });
});

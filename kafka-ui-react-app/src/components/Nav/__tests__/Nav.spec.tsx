import React from 'react';
import { onlineClusterPayload } from 'redux/reducers/clusters/__test__/fixtures';
import Nav from 'components/Nav/Nav';
import { mountWithTheme } from 'lib/testHelpers';
import { StaticRouter } from 'react-router';

describe('Nav', () => {
  it('renders loader', () => {
    const wrapper = mountWithTheme(
      <StaticRouter>
        <Nav clusters={[]} />
      </StaticRouter>
    );
    expect(wrapper.find('.loader')).toBeTruthy();
    expect(wrapper.exists('ClusterMenu')).toBeFalsy();
  });

  it('renders ClusterMenu', () => {
    const wrapper = mountWithTheme(
      <StaticRouter>
        <Nav clusters={[onlineClusterPayload]} isClusterListFetched />
      </StaticRouter>
    );
    expect(wrapper.exists('.loader')).toBeFalsy();
    expect(wrapper.exists('ClusterMenu')).toBeTruthy();
    expect(wrapper).toMatchSnapshot();
  });
});

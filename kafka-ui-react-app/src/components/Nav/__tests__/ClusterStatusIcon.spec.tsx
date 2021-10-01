import React from 'react';
import { mount } from 'enzyme';
import { ServerStatus } from 'generated-sources';
import ClusterStatusIcon from 'components/Nav/ClusterStatusIcon';

describe('ClusterStatusIcon', () => {
  describe('when online', () => {
    it('matches snapshot', () => {
      const wrapper = mount(<ClusterStatusIcon status={ServerStatus.ONLINE} />);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('when offline', () => {
    it('matches snapshot', () => {
      const wrapper = mount(
        <ClusterStatusIcon status={ServerStatus.OFFLINE} />
      );
      expect(wrapper).toMatchSnapshot();
    });
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from 'components/Dashboard/Dashboard';

const component = shallow(<Dashboard />);

describe('Dashboard', () => {
  it('section can be truthy', () => {
    const wrapper = component.find('.section');
    expect(wrapper).toBeTruthy();
  });

  it('ClustersWidgetContainer can be truthy', () => {
    const wrapper = component.find('ClustersWidgetContainer');
    expect(wrapper).toBeTruthy();
  });
});

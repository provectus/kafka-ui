import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from 'components/Dashboard/Dashboard';

const component = shallow(<Dashboard />);

describe('Dashboard', () => {
  it('section can be truthy', () => {
    const wrapper = component.find('.section');
    expect(wrapper).toBeTruthy();
  });

  it('level can be truthy', () => {
    const wrapper = component.find('.level');
    expect(wrapper).toBeTruthy();
  });

  it('level-item can be truthy', () => {
    const wrapper = component.find('.level-item');
    expect(wrapper).toBeTruthy();
  });

  it('level-item can be truthy', () => {
    const wrapper = component.find('Breadcrumb');
    expect(wrapper).toBeTruthy();
  });

  it('ClustersWidgetContainer can be truthy', () => {
    const wrapper = component.find('ClustersWidgetContainer');
    expect(wrapper).toBeTruthy();
  });
});

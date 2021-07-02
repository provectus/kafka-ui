import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from 'components/Dashboard/Dashboard';

const component = shallow(<Dashboard />);

describe('Dashboard', () => {
  it('renders section', () => {
    expect(component.exists('.section')).toBe(true);
  });

  it('renders ClustersWidget', () => {
    expect(component.exists('Connect(ClustersWidget)')).toBe(true);
  });
});

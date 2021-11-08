import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from 'components/Dashboard/Dashboard';

const component = shallow(<Dashboard />);

describe('Dashboard', () => {
  it('matches snapshot', () => {
    expect(component.exists('.section')).toMatchSnapshot();
  });

  it('renders ClustersWidget', () => {
    expect(component.exists('Connect(ClustersWidget)')).toBe(true);
  });
});

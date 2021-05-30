import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from 'components/Dashboard/Dashboard';

describe('Dashboard', () => {
  it('is Dashboard truthy', () => {
    const component = shallow(<Dashboard />);

    expect(component.exists('.section')).toBeTruthy();
  });
});

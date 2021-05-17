import React from 'react';
import { shallow } from 'enzyme';
import Connect from 'components/Connect/Connect';

describe('Connect', () => {
  it('matches snapshot', () => {
    const wrapper = shallow(<Connect />);
    expect(wrapper).toMatchSnapshot();
  });
});

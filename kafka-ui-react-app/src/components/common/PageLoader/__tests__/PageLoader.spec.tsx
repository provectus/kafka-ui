import { mount } from 'enzyme';
import React from 'react';
import PageLoader from '../PageLoader';

describe('PageLoader', () => {
  it('matches the snapshot', () => {
    const component = mount(<PageLoader />);
    expect(component).toMatchSnapshot();
  });
});

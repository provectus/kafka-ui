import { mount } from 'enzyme';
import React from 'react';
import PageLoader from '../PageLoader';

describe('PageLoader', () => {
  it('matches the snapshot', () => {
    expect(mount(<PageLoader />)).toMatchSnapshot();
  });

  it('renders half-height page loader by default', () => {
    const wrapper = mount(<PageLoader />);
    expect(wrapper.exists('.hero.is-halfheight')).toBeTruthy();
    expect(wrapper.exists('.hero.is-fullheight-with-navbar')).toBeFalsy();
  });

  it('renders fullheight page loader', () => {
    const wrapper = mount(<PageLoader fullHeight />);
    expect(wrapper.exists('.hero.is-halfheight')).toBeFalsy();
    expect(wrapper.exists('.hero.is-fullheight-with-navbar')).toBeTruthy();
  });
});

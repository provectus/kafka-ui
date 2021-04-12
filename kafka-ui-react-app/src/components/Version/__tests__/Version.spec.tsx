import React from 'react';
import { mount } from 'enzyme';
import Version from '../Version';

const tag = 'v1.0.1-SHAPSHOT';
const commit = '123sdf34';

describe('Version', () => {
  it('shows nothing if tag is not defined', () => {
    const component = mount(<Version />);
    expect(component.html()).toEqual(null);
  });

  it('shows current tag when only tag is defined', () => {
    const component = mount(<Version tag={tag} />);
    expect(component.text()).toContain(tag);
  });

  it('shows current tag and commit', () => {
    const component = mount(<Version tag={tag} commit={commit} />);
    expect(component.text()).toContain(tag);
    expect(component.text()).toContain(commit);
  });

  it('matches snapshot', () => {
    const component = mount(<Version tag={tag} commit={commit} />);
    expect(component).toMatchSnapshot();
  });
});

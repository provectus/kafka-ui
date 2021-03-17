import React from 'react';
import { mount, shallow } from 'enzyme';
import { StaticRouter } from 'react-router';
import PageControl, { PageControlProps } from '../PageControl';

const page = 138;

describe('PageControl', () => {
  const setupWrapper = (props: Partial<PageControlProps> = {}) => (
    <StaticRouter>
      <PageControl url="/test" page={page} current {...props} />
    </StaticRouter>
  );

  it('renders current page', () => {
    const wrapper = mount(setupWrapper({ current: true }));
    expect(wrapper.exists('.pagination-link.is-current')).toBeTruthy();
  });

  it('renders non-current page', () => {
    const wrapper = mount(setupWrapper({ current: false }));
    expect(wrapper.exists('.pagination-link.is-current')).toBeFalsy();
  });

  it('renders page number', () => {
    const wrapper = mount(setupWrapper({ current: false }));
    expect(wrapper.text()).toEqual(String(page));
  });

  it('matches snapshot', () => {
    const wrapper = shallow(<PageControl url="/test" page={page} current />);
    expect(wrapper).toMatchSnapshot();
  });
});

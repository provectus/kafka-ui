import React from 'react';
import { mount, shallow } from 'enzyme';
import { schema } from './fixtures';
import LatestVersionItem from '../LatestVersionItem';

describe('LatestVersionItem', () => {
  it('renders latest version of schema', () => {
    const wrapper = mount(<LatestVersionItem schema={schema} />);

    expect(wrapper.find('table').length).toEqual(1);
    expect(wrapper.find('td').at(1).text()).toEqual('1');
    expect(wrapper.exists('JSONViewer')).toBeTruthy();
  });

  it('matches snapshot', () => {
    expect(shallow(<LatestVersionItem schema={schema} />)).toMatchSnapshot();
  });
});

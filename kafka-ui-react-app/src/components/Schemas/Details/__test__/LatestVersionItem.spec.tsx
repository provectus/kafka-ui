import React from 'react';
import { mount, shallow } from 'enzyme';
import LatestVersionItem from 'components/Schemas/Details/LatestVersionItem';

import { schema } from './fixtures';

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

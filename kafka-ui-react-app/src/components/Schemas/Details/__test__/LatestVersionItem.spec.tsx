import React from 'react';
import { mount, shallow } from 'enzyme';
import LatestVersionItem from 'components/Schemas/Details/LatestVersionItem';

import { jsonSchema, protoSchema } from './fixtures';

describe('LatestVersionItem', () => {
  it('renders latest version of json schema', () => {
    const wrapper = mount(<LatestVersionItem schema={jsonSchema} />);

    expect(wrapper.find('table').length).toEqual(1);
    expect(wrapper.find('td').at(1).text()).toEqual('1');
    expect(wrapper.exists('JSONEditor')).toBeTruthy();
  });

  it('renders latest version of proto schema', () => {
    const wrapper = mount(<LatestVersionItem schema={protoSchema} />);

    expect(wrapper.find('table').length).toEqual(1);
    expect(wrapper.find('td').at(1).text()).toEqual('2');
    expect(wrapper.exists('JSONEditor')).toBeTruthy();
  });

  it('matches snapshot', () => {
    expect(
      shallow(<LatestVersionItem schema={jsonSchema} />)
    ).toMatchSnapshot();
  });
});

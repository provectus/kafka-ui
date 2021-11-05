import React from 'react';
import { mount, shallow } from 'enzyme';
import LatestVersionItem from 'components/Schemas/Details/LatestVersion/LatestVersionItem';

import { jsonSchema, protoSchema } from './fixtures';

describe('LatestVersionItem', () => {
  it('renders latest version of json schema', () => {
    const wrapper = mount(<LatestVersionItem schema={jsonSchema} />);

    expect(wrapper.find('div[data-testid="meta-data"]').length).toEqual(1);
    expect(
      wrapper.find('div[data-testid="meta-data"] > div:first-child > p').text()
    ).toEqual('1');
    expect(wrapper.exists('JSONViewer')).toBeTruthy();
  });

  it('renders latest version of compatibility', () => {
    const wrapper = mount(<LatestVersionItem schema={protoSchema} />);

    expect(wrapper.find('div[data-testid="meta-data"]').length).toEqual(1);
    expect(
      wrapper.find('div[data-testid="meta-data"] > div:last-child > p').text()
    ).toEqual('BACKWARD');
    expect(wrapper.exists('JSONViewer')).toBeTruthy();
  });

  it('matches snapshot', () => {
    expect(
      shallow(<LatestVersionItem schema={jsonSchema} />)
    ).toMatchSnapshot();
  });
});

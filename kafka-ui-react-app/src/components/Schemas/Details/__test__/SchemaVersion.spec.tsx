import React from 'react';
import { shallow } from 'enzyme';
import SchemaVersion from '../SchemaVersion';
import { versions } from './fixtures';

describe('SchemaVersion', () => {
  it('renders versions', () => {
    const wrapper = shallow(<SchemaVersion version={versions[0]} />);

    expect(wrapper.find('td').length).toEqual(3);
    expect(wrapper.exists('JSONViewer')).toBeTruthy();
  });

  it('matches snapshot', () => {
    expect(shallow(<SchemaVersion version={versions[0]} />)).toMatchSnapshot();
  });
});

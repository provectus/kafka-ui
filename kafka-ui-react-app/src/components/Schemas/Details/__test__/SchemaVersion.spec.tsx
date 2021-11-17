import React from 'react';
import { shallow, mount } from 'enzyme';
import SchemaVersion from 'components/Schemas/Details/SchemaVersion/SchemaVersion';

import { versions } from './fixtures';

describe('SchemaVersion', () => {
  it('renders versions', () => {
    const wrapper = mount(
      <table>
        <tbody>
          <SchemaVersion version={versions[0]} />
        </tbody>
      </table>
    );

    expect(wrapper.find('td').length).toEqual(3);
    expect(wrapper.exists('JSONEditor')).toBeFalsy();
    wrapper.find('span').simulate('click');
    expect(wrapper.exists('JSONEditor')).toBeTruthy();
  });

  it('matches snapshot', () => {
    expect(shallow(<SchemaVersion version={versions[0]} />)).toMatchSnapshot();
  });
});

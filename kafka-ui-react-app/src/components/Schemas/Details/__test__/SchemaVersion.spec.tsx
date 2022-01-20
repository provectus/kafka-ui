import React from 'react';
import { shallow, mount } from 'enzyme';
import SchemaVersion from 'components/Schemas/Details/SchemaVersion/SchemaVersion';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

import { versions } from './fixtures';

describe('SchemaVersion', () => {
  it('renders versions', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <table>
          <tbody>
            <SchemaVersion version={versions[0]} />
          </tbody>
        </table>
      </ThemeProvider>
    );

    expect(wrapper.find('td').length).toEqual(3);
    expect(wrapper.exists('Editor')).toBeFalsy();
    wrapper.find('span').simulate('click');
    expect(wrapper.exists('Editor')).toBeTruthy();
  });

  it('matches snapshot', () => {
    expect(
      shallow(
        <ThemeProvider theme={theme}>
          <SchemaVersion version={versions[0]} />
        </ThemeProvider>
      )
    ).toMatchSnapshot();
  });
});

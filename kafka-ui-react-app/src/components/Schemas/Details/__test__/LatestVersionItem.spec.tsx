import React from 'react';
import { mount, shallow } from 'enzyme';
import LatestVersionItem from 'components/Schemas/Details/LatestVersion/LatestVersionItem';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

import { jsonSchema, protoSchema } from './fixtures';

describe('LatestVersionItem', () => {
  it('renders latest version of json schema', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <LatestVersionItem schema={jsonSchema} />
      </ThemeProvider>
    );

    expect(wrapper.find('div[data-testid="meta-data"]').length).toEqual(1);
    expect(
      wrapper.find('div[data-testid="meta-data"] > div:first-child > p').text()
    ).toEqual('1');
    expect(wrapper.exists('EditorViewer')).toBeTruthy();
  });

  it('renders latest version of compatibility', () => {
    const wrapper = mount(
      <ThemeProvider theme={theme}>
        <LatestVersionItem schema={protoSchema} />
      </ThemeProvider>
    );

    expect(wrapper.find('div[data-testid="meta-data"]').length).toEqual(1);
    expect(
      wrapper.find('div[data-testid="meta-data"] > div:last-child > p').text()
    ).toEqual('BACKWARD');
    expect(wrapper.exists('EditorViewer')).toBeTruthy();
  });

  it('matches snapshot', () => {
    expect(
      shallow(
        <ThemeProvider theme={theme}>
          <LatestVersionItem schema={jsonSchema} />
        </ThemeProvider>
      )
    ).toMatchSnapshot();
  });
});

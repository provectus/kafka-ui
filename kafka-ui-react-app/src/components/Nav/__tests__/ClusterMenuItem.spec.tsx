import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router';
import ClusterMenuItem, {
  MenuItemProps,
} from 'components/Nav/ClusterMenuItem/ClusterMenuItem';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

describe('ClusterMenuItem', () => {
  const setupComponent = (props: MenuItemProps) => (
    <ThemeProvider theme={theme}>
      <StaticRouter>
        <ClusterMenuItem {...props} />
      </StaticRouter>
    </ThemeProvider>
  );

  it('renders with NavLink', () => {
    const wrapper = mount(
      setupComponent({
        liType: 'primary',
        to: 'test-url',
      })
    );
    expect(wrapper.find('a').length).toEqual(1);
  });

  it('renders without NavLink', () => {
    const wrapper = mount(
      setupComponent({
        liType: 'primary',
      })
    );
    expect(wrapper.find('a').length).toEqual(0);
  });
});

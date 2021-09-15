import React from 'react';
import { StaticRouter } from 'react-router';
import ClusterMenuItem, {
  MenuItemProps,
} from 'components/Nav/ClusterMenuItem/ClusterMenuItem';
import { mountWithTheme } from 'lib/testHelpers';

describe('ClusterMenuItem', () => {
  const setupComponent = (props: MenuItemProps) => (
    <StaticRouter>
      <ClusterMenuItem {...props} />
    </StaticRouter>
  );

  it('renders with NavLink', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        liType: 'primary',
        to: 'test-url',
      })
    );
    expect(wrapper.find('a').length).toEqual(1);
  });

  it('renders without NavLink', () => {
    const wrapper = mountWithTheme(
      setupComponent({
        liType: 'primary',
      })
    );
    expect(wrapper.find('a').length).toEqual(0);
  });
});

import React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router';
import ClusterMenuItem, {
  MenuItemProps,
} from 'components/Nav/ClusterMenuItem/ClusterMenuItem';

describe('ClusterMenuItem', () => {
  const setupComponent = (props: MenuItemProps) => (
    <StaticRouter>
      <ClusterMenuItem {...props} />
    </StaticRouter>
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

import React from 'react';
import { StaticRouter } from 'react-router';
import ClusterMenuItem, {
  MenuItemProps,
} from 'components/Nav/ClusterMenuItem/ClusterMenuItem';
import { mountWithTheme } from 'lib/testHelpers';

describe('ClusterMenuItem', () => {
  const setupComponent = (props?: MenuItemProps) => (
    <StaticRouter>
      <ClusterMenuItem to="/test" {...props} />
    </StaticRouter>
  );

  it('matches the snapshot', () => {
    const wrapper = mountWithTheme(setupComponent());
    expect(wrapper).toMatchSnapshot();
  });
});

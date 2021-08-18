import React from 'react';
import { StaticRouter } from 'react-router';
import Breadcrumbs from 'components/KsqlDb/BreadCrumbs/BreadCrumbs';
import { mount } from 'enzyme';
import { clusterKsqlDbPath, clusterKsqlDbQueryPath } from 'lib/paths';

describe('BreadCrumbs', () => {
  const clusterName = 'local';
  const rootPathname = clusterKsqlDbPath(clusterName);
  const queryPathname = clusterKsqlDbQueryPath(clusterName);

  const setupComponent = (pathname: string) => (
    <StaticRouter location={{ pathname }} context={{}}>
      <Breadcrumbs />
    </StaticRouter>
  );

  it('Renders root path', () => {
    const component = mount(setupComponent(rootPathname));

    expect(component.find({ children: 'KSQLDB' }).exists()).toBeTruthy();
    expect(component.find({ children: 'Query' }).exists()).toBeFalsy();
  });

  it('Renders query path', () => {
    const component = mount(setupComponent(queryPathname));

    expect(
      component.find('a').find({ children: 'KSQLDB' }).exists()
    ).toBeTruthy();
    expect(component.find({ children: 'Query' }).exists()).toBeTruthy();
  });
});

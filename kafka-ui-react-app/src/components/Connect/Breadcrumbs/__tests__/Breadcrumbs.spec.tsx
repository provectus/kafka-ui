import React from 'react';
import { create } from 'react-test-renderer';
import Breadcrumbs from 'components/Connect/Breadcrumbs/Breadcrumbs';
import {
  clusterConnectConnectorEditPath,
  clusterConnectConnectorPath,
  clusterConnectorNewPath,
  clusterConnectorsPath,
} from 'lib/paths';
import { TestRouterWrapper } from 'lib/testHelpers';

describe('Breadcrumbs', () => {
  const setupWrapper = (pathname: string) => (
    <TestRouterWrapper
      pathname={pathname}
      urlParams={{
        clusterName: 'my-cluster',
        connectName: 'my-connect',
        connectorName: 'my-connector',
      }}
    >
      <Breadcrumbs />
    </TestRouterWrapper>
  );

  it('matches snapshot for root path', () => {
    expect(
      create(setupWrapper(clusterConnectorsPath(':clusterName'))).toJSON()
    ).toMatchSnapshot();
  });

  it('matches snapshot for new connector path', () => {
    expect(
      create(setupWrapper(clusterConnectorNewPath(':clusterName'))).toJSON()
    ).toMatchSnapshot();
  });

  it('matches snapshot for connector edit path', () => {
    expect(
      create(
        setupWrapper(
          clusterConnectConnectorEditPath(
            ':clusterName',
            ':connectName',
            ':connectorName'
          )
        )
      ).toJSON()
    ).toMatchSnapshot();
  });

  it('matches snapshot for connector path', () => {
    expect(
      create(
        setupWrapper(
          clusterConnectConnectorPath(
            ':clusterName',
            ':connectName',
            ':connectorName'
          )
        )
      ).toJSON()
    ).toMatchSnapshot();
  });
});

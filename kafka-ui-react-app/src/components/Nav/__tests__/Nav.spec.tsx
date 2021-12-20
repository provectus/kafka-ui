import React from 'react';
import {
  offlineClusterPayload,
  onlineClusterPayload,
} from 'redux/reducers/clusters/__test__/fixtures';
import Nav from 'components/Nav/Nav';
import { StaticRouter } from 'react-router';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

describe('Nav', () => {
  it('renders loader', () => {
    render(
      <StaticRouter>
        <Nav clusters={[]} />
      </StaticRouter>
    );
    expect(screen.getAllByRole('menuitem').length).toEqual(1);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders ClusterMenu', () => {
    render(
      <StaticRouter>
        <Nav
          clusters={[onlineClusterPayload, offlineClusterPayload]}
          areClustersFulfilled
        />
      </StaticRouter>
    );
    expect(screen.getAllByRole('menu').length).toEqual(3);
    expect(screen.getAllByRole('menuitem').length).toEqual(3);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();
    expect(screen.getByText(offlineClusterPayload.name)).toBeInTheDocument();
  });
});

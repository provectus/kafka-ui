import React from 'react';
import {
  offlineClusterPayload,
  onlineClusterPayload,
} from 'redux/reducers/clusters/__test__/fixtures';
import Nav from 'components/Nav/Nav';
import { StaticRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

describe('Nav', () => {
  it('renders loader', () => {
    render(
      <ThemeProvider theme={theme}>
        <StaticRouter>
          <Nav clusters={[]} />
        </StaticRouter>
      </ThemeProvider>
    );
    expect(screen.getAllByRole('listitem').length).toEqual(1);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders ClusterMenu', () => {
    render(
      <ThemeProvider theme={theme}>
        <StaticRouter>
          <Nav
            clusters={[onlineClusterPayload, offlineClusterPayload]}
            isClusterListFetched
          />
        </StaticRouter>
      </ThemeProvider>
    );

    expect(screen.getAllByRole('list').length).toEqual(3);
    expect(screen.getAllByRole('listitem').length).toEqual(3);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(onlineClusterPayload.name)).toBeInTheDocument();
    expect(screen.getByText(offlineClusterPayload.name)).toBeInTheDocument();
  });
});

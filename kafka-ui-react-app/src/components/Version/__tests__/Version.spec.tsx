import React from 'react';
import Version, { VesionProps } from 'components/Version/Version';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import dayjs from 'dayjs';

const tag = 'v1.0.1-SHAPSHOT';
const commit = '123sdf34';
const date = 'Wed Jun 8 17:22:04 2022 +0300';

describe('Version', () => {
  const setupComponent = (props: VesionProps) => render(<Version {...props} />);

  it('shows latest commit hash and date', () => {
    setupComponent({ tag, commit, date });
    expect(screen.getByText(commit)).toBeInTheDocument();
    expect(
      screen.getByText(dayjs(date).format('MM.DD.YYYY HH:mm:ss'))
    ).toBeInTheDocument();
  });

  it('do shows any build information when tag, commit, date are undefined', () => {
    setupComponent({});
    expect(screen.queryByText(commit)).not.toBeInTheDocument();
    expect(
      screen.queryByText(dayjs(date).format('MM.DD.YYYY HH:mm:ss'))
    ).not.toBeInTheDocument();
  });
});

import React from 'react';
import Version, { VesionProps } from 'components/Version/Version';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import dayjs from 'dayjs';

const tag = 'v1.0.1-SHAPSHOT';
const commit = { hash: '123sdf34', date: 'Wed Jun 8 17:22:04 2022 +0300' };

describe('Version', () => {
  const setupComponent = (props: VesionProps) => render(<Version {...props} />);

  it('shows latest commit hash and date', () => {
    setupComponent({ tag, commit });
    expect(screen.getByText(commit.hash)).toBeInTheDocument();
    expect(
      screen.getByText(dayjs(commit?.date).format('MM.DD.YYYY HH:mm:ss'))
    ).toBeInTheDocument();
  });
});

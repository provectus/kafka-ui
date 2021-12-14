import React from 'react';
import { Indicator } from 'components/common/Metrics';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

const title = 'Test Title';
const label = 'Test Label';
const child = 'Child';

describe('Indicator', () => {
  it('matches the snapshot', () => {
    render(
      <Indicator title={title} label="Test Label">
        {child}
      </Indicator>
    );
    expect(screen.getByTitle(title)).toBeInTheDocument();
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText(child)).toBeInTheDocument();
  });
});

import React from 'react';
import { Section } from 'components/common/Metrics';
import { render, screen } from '@testing-library/react';

const child = 'Child';
const title = 'Test Title';

describe('Metrics.Section', () => {
  it('renders without title', () => {
    render(<Section>{child}</Section>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText(child)).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Section title={title}>{child}</Section>);
    expect(screen.queryByRole('heading')).toBeInTheDocument();
    expect(screen.getByText(child)).toBeInTheDocument();
  });
});

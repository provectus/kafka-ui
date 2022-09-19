import React from 'react';
import LatestVersionItem from 'components/Schemas/Details/LatestVersion/LatestVersionItem';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

import { jsonSchema, protoSchema } from './fixtures';

describe('LatestVersionItem', () => {
  it('renders latest version of json schema', () => {
    render(<LatestVersionItem schema={jsonSchema} />);
    expect(screen.getByText('Actual version')).toBeInTheDocument();
    expect(screen.getByText('Latest version')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Compatibility')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders latest version of compatibility', () => {
    render(<LatestVersionItem schema={protoSchema} />);
    expect(screen.getByText('Actual version')).toBeInTheDocument();
    expect(screen.getByText('Latest version')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Compatibility')).toBeInTheDocument();
    expect(screen.getByText('BACKWARD')).toBeInTheDocument();
  });
});

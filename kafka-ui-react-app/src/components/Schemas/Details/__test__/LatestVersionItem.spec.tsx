import React from 'react';
import LatestVersionItem from 'components/Schemas/Details/LatestVersion/LatestVersionItem';
import { SchemaSubject } from 'generated-sources';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

import { jsonSchema, protoSchema } from './fixtures';

const renderComponent = (schema: SchemaSubject) => {
  render(<LatestVersionItem schema={schema} />);
};

describe('LatestVersionItem', () => {
  it('renders latest version of json schema', () => {
    renderComponent(jsonSchema);
    expect(screen.getByText('Relevant version')).toBeInTheDocument();
    expect(screen.getByText('Latest version')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Compatibility')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByTestId('json-viewer')).toBeInTheDocument();
  });

  it('renders latest version of compatibility', () => {
    renderComponent(protoSchema);
    expect(screen.getByText('Relevant version')).toBeInTheDocument();
    expect(screen.getByText('Latest version')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Compatibility')).toBeInTheDocument();

    expect(screen.getByText('BACKWARD')).toBeInTheDocument();
    expect(screen.getByTestId('json-viewer')).toBeInTheDocument();
  });
});

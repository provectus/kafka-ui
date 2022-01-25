import React from 'react';
import SchemaVersion from 'components/Schemas/Details/SchemaVersion/SchemaVersion';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

import { versions } from './fixtures';

const renderComponent = () => {
  render(
    <ThemeProvider theme={theme}>
      <table>
        <tbody>
          <SchemaVersion version={versions[0]} />
        </tbody>
      </table>
    </ThemeProvider>
  );
};
describe('SchemaVersion', () => {
  it('renders versions', () => {
    renderComponent();
    expect(screen.getAllByRole('cell')).toHaveLength(3);
    expect(screen.queryByTestId('json-viewer')).not.toBeInTheDocument();
    userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('json-viewer')).toBeInTheDocument();
  });
});

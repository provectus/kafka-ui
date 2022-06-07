import React from 'react';
import ListItem, { ListItemProps } from 'components/Schemas/List/ListItem';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';

import { schemas } from './fixtures';

describe('ListItem', () => {
  const setupComponent = (props: ListItemProps = { subject: schemas[0] }) =>
    render(
      <table>
        <tbody>
          <ListItem {...props} />
        </tbody>
      </table>
    );

  it('renders schemas', () => {
    setupComponent();
    expect(screen.getAllByRole('link').length).toEqual(1);
    expect(screen.getAllByRole('cell').length).toEqual(3);
  });
});

import React from 'react';
import ListItem from 'components/ConsumerGroups/List/ListItem';
import { ConsumerGroupState, ConsumerGroup } from 'generated-sources';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

import { consumerGroup } from './__fixtures__';

const renderComponent = (cg: ConsumerGroup = consumerGroup) =>
  render(
    <table>
      <tbody>
        <ListItem consumerGroup={cg} />
      </tbody>
    </table>
  );

describe('List', () => {
  it('render empty ListItem', () => {
    renderComponent();

    expect(screen.getByRole('row', { name: /group1/i })).toBeInTheDocument();
  });

  it('renders item with stable status', () => {
    renderComponent();

    expect(
      screen.getByRole('cell', { name: ConsumerGroupState.STABLE })
    ).toBeInTheDocument();
  });

  it('renders item with dead status', () => {
    renderComponent({
      ...consumerGroup,
      state: ConsumerGroupState.DEAD,
    });

    expect(
      screen.getByRole('cell', { name: ConsumerGroupState.DEAD })
    ).toBeInTheDocument();
  });

  it('renders item with empty status', () => {
    renderComponent({
      ...consumerGroup,
      state: ConsumerGroupState.EMPTY,
    });

    expect(
      screen.getByRole('cell', { name: ConsumerGroupState.EMPTY })
    ).toBeInTheDocument();
  });

  it('renders item with empty-string status', () => {
    renderComponent({
      ...consumerGroup,
      state: ConsumerGroupState.UNKNOWN,
    });

    expect(
      screen.getByRole('cell', { name: ConsumerGroupState.UNKNOWN })
    ).toBeInTheDocument();
  });
});

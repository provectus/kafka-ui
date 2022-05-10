import React from 'react';
import Tabs from 'components/common/Tabs/Tabs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Tabs component', () => {
  const tabs: string[] = ['Tab 1', 'Tab 2', 'Tab 3'];

  const child1 = <div data-testid="child_1" />;
  const child2 = <div data-testid="child_2" />;
  const child3 = <div data-testid="child_3" />;

  beforeEach(() =>
    render(
      <Tabs tabs={tabs}>
        {child1}
        {child2}
        {child3}
      </Tabs>
    )
  );

  it('renders the tabs with default index 0', () => {
    expect(screen.getAllByRole('listitem')[0]).toHaveClass('is-active');
  });
  it('renders the list of tabs', () => {
    screen.queryAllByRole('button').forEach((link, idx) => {
      expect(link).toHaveTextContent(tabs[idx]);
    });
  });
  it('expects list items to be in the document', () => {
    screen.queryAllByRole('button').forEach((link, idx) => {
      userEvent.click(link);
      expect(screen.getByTestId(`child_${idx + 1}`)).toBeInTheDocument();
    });
  });
});

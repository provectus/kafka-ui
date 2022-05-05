import React from 'react';
import Tabs from 'components/common/Tabs/Tabs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Tabs component', () => {
  const tabs: string[] = ['Tab 1', 'Tab 2', 'Tab 3'];

  const child1 = <div className="child_1" />;
  const child2 = <div className="child_2" />;
  const child3 = <div className="child_3" />;

  render(
    <Tabs tabs={tabs}>
      {child1}
      {child2}
      {child3}
    </Tabs>
  );

  it('renders the tabs with default index 0', () => {
    expect(screen.queryAllByRole('listitem')[0]).toHaveClass('is-active');
  });
  it('renders the list of tabs', () => {
    screen.queryAllByRole('button').forEach((link, idx) => {
      expect(link).toHaveTextContent(tabs[idx]);
    });
  });
  it('renders the children', () => {
    screen.queryAllByRole('button').forEach((link, idx) => {
      userEvent.click(link);
      expect(screen.getByTestId(`.child_${idx + 1}`)).toBeInTheDocument();
    });
  });
  it('matches the snapshot', () => {
    const { container } = render(
      <Tabs tabs={tabs}>
        {child1}
        {child2}
        {child3}
      </Tabs>
    );
    expect(container).toBeInTheDocument();
  });
});

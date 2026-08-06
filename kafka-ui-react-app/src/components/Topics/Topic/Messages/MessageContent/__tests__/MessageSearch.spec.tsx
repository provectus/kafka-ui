import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import MessageSearch, {
  MessageSearchProps,
} from 'components/Topics/Topic/Messages/MessageContent/MessageSearch';

const handlers = () => ({
  onChange: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onClose: jest.fn(),
});

const setupComponent = (props: Partial<MessageSearchProps> = {}) => {
  const spies = handlers();
  render(
    <MessageSearch
      term=""
      matchCount={0}
      currentMatch={0}
      {...spies}
      {...props}
    />
  );
  return spies;
};

const getInput = () => screen.getByRole('textbox', { name: 'Find in message' });

describe('MessageSearch component', () => {
  it('reports the typed term on every keystroke', async () => {
    const { onChange } = setupComponent();

    await userEvent.type(getInput(), 'ab');

    // Controlled input with a static term, so each keystroke reports one char.
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith('b');
  });

  it('shows nothing until something has been typed', () => {
    setupComponent();
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('explains the minimum length instead of claiming no results', () => {
    setupComponent({ term: 'a' });
    expect(screen.getByRole('status')).toHaveTextContent('2+ chars');
  });

  it('reports no results for a searched term without matches', () => {
    setupComponent({ term: 'abc', matchCount: 0 });
    expect(screen.getByRole('status')).toHaveTextContent('No results');
  });

  it('renders the match position', () => {
    setupComponent({ term: 'abc', matchCount: 7, currentMatch: 2 });
    expect(screen.getByRole('status')).toHaveTextContent('2 / 7');
  });

  it('disables navigation while there are no matches', () => {
    setupComponent({ term: 'abc', matchCount: 0 });

    expect(screen.getByRole('button', { name: 'Next match' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Previous match' })
    ).toBeDisabled();
  });

  it('navigates with the next and previous buttons', async () => {
    const { onNext, onPrevious } = setupComponent({
      term: 'abc',
      matchCount: 3,
      currentMatch: 1,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Next match' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Previous match' })
    );

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('navigates with Enter and Shift+Enter', async () => {
    const { onNext, onPrevious } = setupComponent({
      term: 'abc',
      matchCount: 3,
      currentMatch: 1,
    });

    getInput().focus();
    await userEvent.keyboard('{Enter}');
    expect(onNext).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const { onClose } = setupComponent({ term: 'abc', matchCount: 3 });

    getInput().focus();
    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes with the close button', async () => {
    const { onClose } = setupComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Close search' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

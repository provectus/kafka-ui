import React from 'react';
import DynamicTextButton from 'components/common/DynamicTextButton/DynamicTextButton';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

describe('DynamicButton', () => {
  const mockCallback = jest.fn();
  it('exectutes callback', () => {
    render(
      <DynamicTextButton
        onClick={mockCallback}
        title="title"
        render={() => 'text'}
      />
    );

    userEvent.click(screen.getByTitle('title'));
    expect(mockCallback).toBeCalled();
  });

  it('changes the text', () => {
    render(
      <DynamicTextButton
        onClick={mockCallback}
        title="title"
        render={(clicked) => (clicked ? 'active' : 'default')}
      />
    );

    const button = screen.getByTitle('title');
    expect(button).toHaveTextContent('default');
    userEvent.click(button);
    expect(button).toHaveTextContent('active');
  });
});

import React from 'react';
import DynamicTextButton from 'components/common/DynamicTextButton/DynamicTextButton';
import { render } from 'lib/testHelpers';
import { fireEvent } from '@testing-library/dom';

describe('DynamicButton', () => {
  const mockCallback = jest.fn();
  it('exectutes callback', () => {
    const component = render(
      <DynamicTextButton
        onClick={mockCallback}
        title="title"
        render={() => 'text'}
      />
    );

    fireEvent.click(
      component.baseElement.querySelector('button') as HTMLElement
    );
    expect(mockCallback).toBeCalled();
  });

  it('changes the text', () => {
    const component = render(
      <DynamicTextButton
        onClick={mockCallback}
        title="title"
        render={(clicked) => (clicked ? 'active' : 'default')}
      />
    );
    expect(component.baseElement).toHaveTextContent('default');
    fireEvent.click(
      component.baseElement.querySelector('button') as HTMLElement
    );
    expect(component.baseElement).toHaveTextContent('active');
  });
});

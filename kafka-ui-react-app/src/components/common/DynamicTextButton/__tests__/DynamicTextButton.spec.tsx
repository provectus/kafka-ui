import React from 'react';
import { mount, shallow } from 'enzyme';
import DynamicTextButton from 'components/common/DynamicTextButton/DynamicTextButton';

describe('DynamicButton', () => {
  const mockCallback = jest.fn();
  it('exectutes callback', () => {
    const component = shallow(
      <DynamicTextButton
        onClick={mockCallback}
        title="title"
        render={() => 'text'}
      />
    );
    component.simulate('click');
    expect(mockCallback).toBeCalled();
  });

  it('changes the text', () => {
    const component = mount(
      <DynamicTextButton
        onClick={mockCallback}
        title="title"
        render={(clicked) => (clicked ? 'active' : 'default')}
      />
    );
    expect(component.text()).toEqual('default');
    component.simulate('click');
    expect(component.text()).toEqual('active');
  });
});

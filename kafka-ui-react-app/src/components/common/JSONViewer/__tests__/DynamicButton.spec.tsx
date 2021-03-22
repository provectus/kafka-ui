import { mount, shallow } from 'enzyme';
import React from 'react';
import DynamicButton from '../DynamicButton';

describe('DynamicButton', () => {
  const mockCallback = jest.fn();
  const text = { default: 'DefaultText', dynamic: 'DynamicText' };
  it('exectutes callback', () => {
    const component = shallow(
      <DynamicButton callback={mockCallback} title="title" text={text} />
    );
    component.simulate('click');
    expect(mockCallback).toBeCalled();
  });

  it('changes the text', () => {
    const component = mount(
      <DynamicButton callback={mockCallback} title="title" text={text} />
    );
    expect(component.text()).toEqual(text.default);
    component.simulate('click');
    expect(component.text()).toEqual(text.dynamic);
  });
});

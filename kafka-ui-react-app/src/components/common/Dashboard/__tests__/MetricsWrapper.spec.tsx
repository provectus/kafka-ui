import { shallow } from 'enzyme';
import React from 'react';
import MetricsWrapper from '../MetricsWrapper';

describe('MetricsWrapper', () => {
  it('correctly adds classes', () => {
    const className = 'className';
    const component = shallow(
      <MetricsWrapper wrapperClassName={className} multiline />
    );
    expect(component.find(`.${className}`).exists()).toBeTruthy();
    expect(component.find('.level-multiline').exists()).toBeTruthy();
  });

  it('correctly renders children', () => {
    let component = shallow(<MetricsWrapper />);
    expect(component.find('.subtitle').exists()).toBeFalsy();

    const title = 'title';
    component = shallow(<MetricsWrapper title={title} />);
    expect(component.find('.subtitle').exists()).toBeTruthy();
    expect(component.text()).toEqual(title);
  });
});

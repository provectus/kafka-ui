import { shallow } from 'enzyme';
import React from 'react';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';

describe('MetricsWrapper', () => {
  it('correctly adds classes', () => {
    const className = 'className';
    const component = shallow(
      <MetricsWrapper wrapperClassName={className} multiline />
    );
    expect(component.exists(`.${className}`)).toBeTruthy();
    expect(component.exists('.level-multiline')).toBeTruthy();
  });

  it('correctly renders children', () => {
    let component = shallow(<MetricsWrapper />);
    expect(component.exists('.subtitle')).toBeFalsy();

    const title = 'title';
    component = shallow(<MetricsWrapper title={title} />);
    expect(component.exists('.subtitle')).toBeTruthy();
    expect(component.text()).toEqual(title);
  });
});

import { mount } from 'enzyme';
import React from 'react';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';

describe('MetricsWrapper', () => {
  it('correctly renders children', () => {
    let component = mount(<MetricsWrapper />);
    expect(component.exists('.is-7')).toBeFalsy();

    const title = 'title';
    component = mount(<MetricsWrapper title={title} />);
    expect(component.exists('.is-7')).toBeTruthy();
    expect(component.text()).toEqual(title);
  });
});

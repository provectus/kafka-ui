import { mount } from 'enzyme';
import React from 'react';
import MetricsSection from 'components/common/Metrics/MetricsSection';

describe('MetricsSection', () => {
  it('correctly renders children', () => {
    let component = mount(<MetricsSection />);
    expect(component.exists('.is-7')).toBeFalsy();

    const title = 'title';
    component = mount(<MetricsSection title={title} />);
    expect(component.exists('.is-7')).toBeTruthy();
    expect(component.text()).toEqual(title);
  });
});

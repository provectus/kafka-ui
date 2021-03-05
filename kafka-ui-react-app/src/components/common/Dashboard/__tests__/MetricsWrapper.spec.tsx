import { mount, shallow } from 'enzyme';
import React from 'react';
import MetricsWrapper from '../MetricsWrapper';

describe('MetricsWrapper', () => {
  it('correctly renders the title', () => {
    const title = 'Title';
    const component = shallow(<MetricsWrapper title={title} />);
    expect(
      component.find('[data-testid="metrics-wrapper-title"]').props().children
    ).toEqual(title);
  });

  it('correctly renders children', () => {
    const child = <div>Child</div>;
    const component = mount(<MetricsWrapper>{child}</MetricsWrapper>);
    expect(
      component
        .find('[data-testid="metrics-wrapper-children"]')
        .containsMatchingElement(child)
    ).toBeTruthy();
  });
});

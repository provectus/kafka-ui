import { shallow, mount } from 'enzyme';
import React from 'react';
import Indicator from '../Indicator';

describe('Indicator', () => {
  it('correctly renders the heading', () => {
    const label = 'label';
    const component = shallow(<Indicator label={label} />);
    expect(
      component.find('[data-testid="indicator-heading"]').props().children
    ).toEqual(label);
  });

  it('correctly renders children', () => {
    const child = 'Child';
    const component = mount(<Indicator label="label">{child}</Indicator>);
    expect(
      component.find('[data-testid="indicator-childer-wrapper"]').props()
        .children
    ).toEqual(child);
  });
});

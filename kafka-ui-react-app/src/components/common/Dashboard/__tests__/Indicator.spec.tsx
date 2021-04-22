import { mount } from 'enzyme';
import React from 'react';
import Indicator from 'components/common/Dashboard/Indicator';

describe('Indicator', () => {
  it('matches the snapshot', () => {
    const child = 'Child';
    const component = mount(
      <Indicator title="title" label="label">
        {child}
      </Indicator>
    );
    expect(component).toMatchSnapshot();
  });
});

import React from 'react';
import { render } from 'lib/testHelpers';
import Connect from 'components/Connect/Connect';

describe('Connect', () => {
  it('matches snapshot', () => {
    const wrapper = render(<Connect />);
    expect(wrapper.baseElement).toMatchSnapshot();
  });
});

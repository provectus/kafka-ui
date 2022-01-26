import React from 'react';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import { render } from 'lib/testHelpers';

describe('SQLEditor component', () => {
  it('matches the snapshot', () => {
    const component = render(<SQLEditor value="" name="name" />);
    expect(component.baseElement).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height', () => {
    const component = render(<SQLEditor value="" name="name" isFixedHeight />);
    expect(component.baseElement).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height with no value', () => {
    const component = render(<SQLEditor name="name" isFixedHeight />);
    expect(component.baseElement).toMatchSnapshot();
  });
});

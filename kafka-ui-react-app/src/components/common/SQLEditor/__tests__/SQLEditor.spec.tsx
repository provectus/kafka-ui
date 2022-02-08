import React from 'react';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import { render } from 'lib/testHelpers';

describe('SQLEditor component', () => {
  it('matches the snapshot', () => {
    const { baseElement } = render(<SQLEditor value="" name="name" />);
    expect(baseElement).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height', () => {
    const { baseElement } = render(
      <SQLEditor value="" name="name" isFixedHeight />
    );
    expect(baseElement).toMatchSnapshot();
  });

  it('matches the snapshot with fixed height with no value', () => {
    const { baseElement } = render(<SQLEditor name="name" isFixedHeight />);
    expect(baseElement).toMatchSnapshot();
  });
});

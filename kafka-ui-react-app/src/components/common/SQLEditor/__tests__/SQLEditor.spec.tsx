import React from 'react';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import { render } from 'lib/testHelpers';

describe('SQLEditor component', () => {
  it('matches the snapshot', () => {
    const { container } = render(<SQLEditor value="" name="name" />);
    expect(container).toBeInTheDocument();
  });

  it('matches the snapshot with fixed height', () => {
    const { container } = render(
      <SQLEditor value="" name="name" isFixedHeight />
    );
    expect(container.children[0].getAttribute('style') !== '16px');
  });

  it('matches the snapshot with fixed height with no value', () => {
    const { container } = render(<SQLEditor value="" name="name" />);
    expect(container.children[0].getAttribute('style') === '16px');
  });
});

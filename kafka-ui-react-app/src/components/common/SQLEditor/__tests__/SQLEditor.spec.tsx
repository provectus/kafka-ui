import React from 'react';
import SQLEditor from 'components/common/SQLEditor/SQLEditor';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

describe('SQLEditor component', () => {
  it('to be in the document with fixed height', () => {
    render(<SQLEditor value="" name="name" isFixedHeight />);
    expect(
      screen.getByRole('textbox').parentElement?.getAttribute('style') !==
        '16px'
    );
  });

  it('to be in the document with fixed height with no value', () => {
    render(<SQLEditor value="" name="name" />);
    expect(
      screen.getByRole('textbox').parentElement?.getAttribute('style') ===
        '16px'
    );
  });
});

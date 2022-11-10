import React from 'react';
import { render } from 'lib/testHelpers';
import ActionButton from 'components/common/ActionButton/ActionButton';

describe('ActionButton', () => {
  it('should make the button disable and view the tooltip', () => {
    render(
      <ActionButton buttonType="primary" buttonSize="M" canDoAction={false} />
    );
  });

  it('should make the button enable and act as a normal button', () => {
    render(
      <ActionButton buttonType="primary" buttonSize="M" canDoAction={false} />
    );
  });
});

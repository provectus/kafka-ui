import React from 'react';
import { screen } from '@testing-library/react';
import ActionButton from 'components/common/ActionComponent/ActionButton/ActionButton';
import { render } from 'lib/testHelpers';
import { Action, ResourceType } from 'generated-sources';

const createText = 'create';
const otherText = 'create';

jest.mock(
  'components/common/ActionComponent/ActionButton/ActionCreateButton/ActionCreateButton',
  () => () => <div>{createText}</div>
);

jest.mock(
  'components/common/ActionComponent/ActionButton/ActionPermissionButton/ActionPermissionButton',
  () => () => <div>{otherText}</div>
);

describe('ActionButton', () => {
  it('should check when passes action create it renders create component', () => {
    render(
      <ActionButton
        permission={{
          action: Action.CREATE,
          resource: ResourceType.CONNECT,
        }}
        buttonType="secondary"
        buttonSize="S"
      />
    );
    expect(screen.getByText(createText)).toBeInTheDocument();
  });

  it('should check when passes other actions types it renders Others component', () => {
    render(
      <ActionButton
        permission={{
          action: Action.EDIT,
          resource: ResourceType.CONNECT,
        }}
        buttonType="secondary"
        buttonSize="S"
      />
    );
    expect(screen.getByText(createText)).toBeInTheDocument();
  });
});

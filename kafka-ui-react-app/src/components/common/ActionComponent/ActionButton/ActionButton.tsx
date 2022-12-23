import React from 'react';
import { Props as ButtonProps } from 'components/common/Button/Button';
import { ActionComponentProps } from 'components/common/ActionComponent/ActionComponent';
import { Action } from 'generated-sources';
import ActionPermissionButton from 'components/common/ActionComponent/ActionButton/ActionPermissionButton/ActionPermissionButton';
import ActionCreateButton from 'components/common/ActionComponent/ActionButton//ActionCreateButton/ActionCreateButton';

interface Props extends ActionComponentProps, ButtonProps {}

const ActionButton: React.FC<Props> = ({ permission, ...props }) => {
  return permission.action === Action.CREATE ? (
    <ActionCreateButton permission={permission} {...props} />
  ) : (
    <ActionPermissionButton permission={permission} {...props} />
  );
};

export default ActionButton;

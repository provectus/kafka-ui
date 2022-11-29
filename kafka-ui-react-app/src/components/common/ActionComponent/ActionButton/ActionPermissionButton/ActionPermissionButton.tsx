import React from 'react';
import { Props as ButtonProps } from 'components/common/Button/Button';
import { ActionComponentProps } from 'components/common/ActionComponent/ActionComponent';
import { usePermission } from 'lib/hooks/usePermission';
import ActionCanButton from 'components/common/ActionComponent/ActionButton/ActionCanButton/ActionCanButton';

interface Props extends ActionComponentProps, ButtonProps {}

const ActionPermissionButton: React.FC<Props> = ({ permission, ...props }) => {
  const canDoAction = usePermission(
    permission.resource,
    permission.action,
    permission.value
  );

  return <ActionCanButton canDoAction={canDoAction} {...props} />;
};

export default ActionPermissionButton;

import React from 'react';
import { Props as ButtonProps } from 'components/common/Button/Button';
import { ActionComponentProps } from 'components/common/ActionComponent/ActionComponent';
import { useCreatePermission } from 'lib/hooks/useCreatePermisson';
import ActionCanButton from 'components/common/ActionComponent/ActionButton/ActionCanButton/ActionCanButton';

interface Props extends ActionComponentProps, ButtonProps {}

const ActionCreateButton: React.FC<Props> = ({ permission, ...props }) => {
  const canDoAction = useCreatePermission(permission.resource);

  return <ActionCanButton canDoAction={canDoAction} {...props} />;
};

export default ActionCreateButton;

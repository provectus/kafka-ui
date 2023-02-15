import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AUTH_OPTIONS, SECURITY_PROTOCOL_OPTIONS } from 'lib/constants';
import Heading from 'components/common/heading/Heading.styled';
import ControlledSelect from 'components/common/Select/ControlledSelect';
import { Button } from 'components/common/Button/Button';
import {
  FlexGrow1,
  FlexRow,
} from 'components/Wizard/WizardForm/WizardForm.styled';

import AuthenticationMethods from './AuthenticationMethods/AuthenticationMethods';

const Authentication: React.FC = () => {
  const { watch, setValue } = useFormContext();
  const hasAuth = !!watch('auth');
  const authMethod = watch('auth.method');
  const hasSecurityProtocolField =
    authMethod && !['Delegation tokens', 'mTLS'].includes(authMethod);

  const toggle = () => setValue('auth', hasAuth ? undefined : {});

  return (
    <>
      <FlexRow>
        <FlexGrow1>
          <Heading level={3}>Authentication</Heading>
        </FlexGrow1>
        <Button buttonSize="M" buttonType="primary" onClick={toggle}>
          {hasAuth ? 'Remove from config' : 'Configure Authentication'}
        </Button>
      </FlexRow>
      {hasAuth && (
        <>
          <ControlledSelect
            name="auth.method"
            label="Authentication Method"
            placeholder="Select authentication method"
            options={AUTH_OPTIONS}
          />
          {hasSecurityProtocolField && (
            <ControlledSelect
              name="auth.securityProtocol"
              label="Security Protocol"
              placeholder="Select security protocol"
              options={SECURITY_PROTOCOL_OPTIONS}
            />
          )}
          <AuthenticationMethods method={authMethod} />
        </>
      )}
    </>
  );
};

export default Authentication;

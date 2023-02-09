import React, { useState } from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import Heading from 'components/common/heading/Heading.styled';
import ControlledSelect from 'components/common/Select/ControlledSelect';
import { METRICS_OPTIONS } from 'lib/constants';
import Checkbox from 'components/common/Checkbox/Checkbox';

const JMXMetrics = () => {
  const [newJMXMetrics, setNewJMXMetrics] = useState(false);
  const { reset, getValues, watch } = useFormContext();
  const showJMXMetrics: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setNewJMXMetrics(!newJMXMetrics);
    if (!newJMXMetrics) {
      reset(
        {
          ...getValues(),
          JMXMetrics: {
            port: '',
            isSSL: '',
            truststoreLocation: '',
            truststorePassword: '',
            keystoreLocation: '',
            keystorePassword: '',
            keystoreKeyPassword: '',
            isAuth: '',
            username: '',
            password: '',
          },
        },
        { keepDefaultValues: true }
      );
    }
  };
  const isSSLisAuth = watch(['Metrics.isSSL', 'Metrics.isAuth']);
  return (
    <>
      <Heading level={3}>Metrics</Heading>
      <div>
        <Button
          buttonSize="M"
          buttonType="primary"
          onClick={(e) => showJMXMetrics(e)}
        >
          {!newJMXMetrics ? 'Configure JMX Metrics' : 'Remove from config'}
        </Button>
      </div>
      {newJMXMetrics && (
        <>
          <ControlledSelect
            name="Metrics.type"
            label="Metrics Type"
            options={METRICS_OPTIONS}
          />
          <div style={{ width: '20%' }}>
            <Input
              label="Port *"
              name="Metrics.port"
              type="number"
              positiveOnly
              withError
            />
          </div>
          <Checkbox name="Metrics.isSSL" label="SSL" cursor="pointer" />
          {isSSLisAuth[0] && (
            <>
              <S.InputContainer>
                <Input
                  label="Truststore location *"
                  name="Metrics.truststoreLocation"
                  type="text"
                  withError
                />
                <Input
                  label="Truststore Password *"
                  name="Metrics.truststorePassword"
                  type="password"
                  withError
                />
              </S.InputContainer>
              <S.KeystoreInputs>
                <Input
                  label="Keystore location"
                  name="Metrics.keystoreLocation"
                  type="text"
                  withError
                />
                <Input
                  label="Keystore Password"
                  name="Metrics.keystorePassword"
                  type="password"
                  withError
                />
                <Input
                  label="Keystore key password"
                  name="Metrics.keystoreKeyPassword"
                  type="password"
                  withError
                />
              </S.KeystoreInputs>
            </>
          )}
          <Checkbox
            name="Metrics.isAuth"
            label="Authentication"
            cursor="pointer"
          />
          {isSSLisAuth[1] && (
            <S.InputContainer>
              <Input
                label="Username *"
                name="Metrics.username"
                type="text"
                withError
              />
              <Input
                label="Password *"
                name="Metrics.password"
                type="password"
                withError
              />
            </S.InputContainer>
          )}
        </>
      )}
    </>
  );
};
export default JMXMetrics;

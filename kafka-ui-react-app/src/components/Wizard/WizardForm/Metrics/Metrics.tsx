import React, { useState } from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { useFormContext } from 'react-hook-form';
import Heading from 'components/common/heading/Heading.styled';
import ControlledSelect from 'components/common/Select/ControlledSelect';
import { METRICS_OPTIONS } from 'lib/constants';
import Checkbox from 'components/common/Checkbox/Checkbox';
import {
  FlexGrow1,
  FlexRow,
} from 'components/Wizard/WizardForm/WizardForm.styled';

const Metrics = () => {
  const [newMetrics, setNewMetrics] = useState(false);
  const { setValue, watch } = useFormContext();
  const showMetrics: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setNewMetrics(!newMetrics);
    if (!newMetrics) {
      setValue('metrics', {
        type: '',
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
      });
    }
  };
  const isSSLisAuth = watch(['metrics.isSSL', 'metrics.isAuth']);
  return (
    <>
      <FlexRow>
        <FlexGrow1>
          <Heading level={3}>Metrics</Heading>
        </FlexGrow1>

        <Button
          buttonSize="M"
          buttonType="primary"
          onClick={(e) => showMetrics(e)}
        >
          {!newMetrics ? 'Configure Metrics' : 'Remove from config'}
        </Button>
      </FlexRow>
      {newMetrics && (
        <>
          <ControlledSelect
            name="metrics.type"
            label="Metrics Type"
            options={METRICS_OPTIONS}
          />
          <S.StyledPort>
            <Input
              label="Port *"
              name="metrics.port"
              type="number"
              positiveOnly
              withError
            />
          </S.StyledPort>
          <Checkbox name="metrics.isSSL" label="SSL" />
          {isSSLisAuth[0] && (
            <>
              <FlexRow>
                <FlexGrow1>
                  <Input
                    label="Truststore location *"
                    name="metrics.truststoreLocation"
                    type="text"
                    withError
                  />
                </FlexGrow1>
                <FlexGrow1>
                  <Input
                    label="Truststore Password *"
                    name="metrics.truststorePassword"
                    type="password"
                    withError
                  />
                </FlexGrow1>
              </FlexRow>
              <FlexRow>
                <FlexGrow1>
                  <Input
                    label="Keystore location"
                    name="metrics.keystoreLocation"
                    type="text"
                    withError
                  />
                </FlexGrow1>
                <FlexGrow1>
                  <Input
                    label="Keystore Password"
                    name="metrics.keystorePassword"
                    type="password"
                    withError
                  />
                </FlexGrow1>
                <FlexGrow1>
                  <Input
                    label="Keystore key password"
                    name="metrics.keystoreKeyPassword"
                    type="password"
                    withError
                  />
                </FlexGrow1>
              </FlexRow>
            </>
          )}
          <Checkbox name="metrics.isAuth" label="Authentication" />
          {isSSLisAuth[1] && (
            <FlexRow>
              <FlexGrow1>
                <Input
                  label="Username *"
                  name="metrics.username"
                  type="text"
                  withError
                />
              </FlexGrow1>
              <FlexGrow1>
                <Input
                  label="Password *"
                  name="metrics.password"
                  type="password"
                  withError
                />
              </FlexGrow1>
            </FlexRow>
          )}
        </>
      )}
    </>
  );
};
export default Metrics;

import React, { useState } from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';
import { InputLabel } from 'components/common/Input/InputLabel.styled';
import Heading from 'components/common/heading/Heading.styled';

const JMXMetrics = () => {
  const [newJMXMetrics, setNewJMXMetrics] = useState(false);
  const {
    register,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();
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
  const isSSLisAuth = watch(['JMXMetrics.isSSL', 'JMXMetrics.isAuth']);
  return (
    <>
      <Heading level={3}>JMX Metrics</Heading>
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
          <div style={{ width: '20%' }}>
            <InputLabel htmlFor="JMXMetrics.port">Port</InputLabel>
            <Input id="JMXMetrics.port" name="JMXMetrics.port" type="number" />
            <FormError>
              <ErrorMessage errors={errors} name="JMXMetrics.port" />
            </FormError>
          </div>
          <div>
            <InputLabel htmlFor="JMXMetrics.isSSL" type="checkbox">
              <input
                {...register('JMXMetrics.isSSL')}
                id="JMXMetrics.isSSL"
                type="checkbox"
              />
              SSL
            </InputLabel>
            <FormError>
              <ErrorMessage errors={errors} name="JMXMetrics.isSSL" />
            </FormError>
          </div>
          {isSSLisAuth[0] && (
            <>
              <S.InputContainer>
                <div>
                  <InputLabel htmlFor="JMXMetrics.truststoreLocation">
                    Truststore location *
                  </InputLabel>
                  <Input
                    id="JMXMetrics.truststoreLocation"
                    name="JMXMetrics.truststoreLocation"
                    type="text"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name="JMXMetrics.truststoreLocation"
                    />
                  </FormError>
                </div>
                <div>
                  <InputLabel htmlFor="JMXMetrics.truststorePassword">
                    Truststore password *
                  </InputLabel>
                  <Input
                    id="JMXMetrics.truststorePassword"
                    name="JMXMetrics.truststorePassword"
                    type="password"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name="JMXMetrics.truststorePassword"
                    />
                  </FormError>
                </div>
              </S.InputContainer>
              <S.KeystoreInputs>
                <div>
                  <InputLabel htmlFor="JMXMetrics.keystoreLocation">
                    Keystore location
                  </InputLabel>
                  <Input
                    id="JMXMetrics.keystoreLocation"
                    name="JMXMetrics.keystoreLocation"
                    type="text"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name="JMXMetrics.keystoreLocation"
                    />
                  </FormError>
                </div>
                <div>
                  <InputLabel htmlFor="JMXMetrics.keystorePassword">
                    Keystore Password
                  </InputLabel>
                  <Input
                    id="JMXMetrics.keystorePassword"
                    name="JMXMetrics.keystorePassword"
                    type="password"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name="JMXMetrics.keystorePassword"
                    />
                  </FormError>
                </div>
                <div>
                  <InputLabel htmlFor="JMXMetrics.keystoreKeyPassword">
                    Keystore key password
                  </InputLabel>
                  <Input
                    id="JMXMetrics.keystoreKeyPassword"
                    name="JMXMetrics.keystoreKeyPassword"
                    type="text"
                  />
                  <FormError>
                    <ErrorMessage
                      errors={errors}
                      name="JMXMetrics.keystoreKeyPassword"
                    />
                  </FormError>
                </div>
              </S.KeystoreInputs>
            </>
          )}
          <div>
            <InputLabel htmlFor="JMXMetrics.isAuth" type="checkbox">
              <input
                {...register('JMXMetrics.isAuth')}
                id="JMXMetrics.isAuth"
                type="checkbox"
              />
              Authentication
            </InputLabel>
            <FormError>
              <ErrorMessage errors={errors} name="JMXMetrics.isAuth" />
            </FormError>
          </div>
          {isSSLisAuth[1] && (
            <div>
              <S.InputContainer>
                <div>
                  <InputLabel htmlFor="JMXMetrics.username">
                    Username *
                  </InputLabel>
                  <Input
                    id="JMXMetrics.username"
                    type="text"
                    name="JMXMetrics.username"
                  />
                  <FormError>
                    <ErrorMessage errors={errors} name="JMXMetrics.username" />
                  </FormError>
                </div>
                <div>
                  <InputLabel htmlFor="JMXMetrics.password">
                    Password *
                  </InputLabel>
                  <Input
                    id="JMXMetrics.password"
                    type="password"
                    name="JMXMetrics.password"
                  />
                  <FormError>
                    <ErrorMessage errors={errors} name="JMXMetrics.password" />
                  </FormError>
                </div>
              </S.InputContainer>
            </div>
          )}
        </>
      )}
    </>
  );
};
export default JMXMetrics;

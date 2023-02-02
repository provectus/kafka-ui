import React, { useState } from 'react';
import * as S from 'components/Wizard/WizardForm/WizardForm.styled';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import { FormError } from 'components/common/Input/Input.styled';
import { ErrorMessage } from '@hookform/error-message';
import { useFormContext } from 'react-hook-form';

const JMXMetrics = () => {
  const [newJMXMetrics, setNewJMXMetrics] = useState(false);
  const methods = useFormContext();
  const showJMXMetrics: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setNewJMXMetrics(!newJMXMetrics);
    if (!newJMXMetrics) {
      methods.reset({
        ...methods.getValues(),
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
      });
    }
  };
  const isSSLisAuth = methods.watch(['JMXMetrics.isSSL', 'JMXMetrics.isAuth']);
  return (
    <S.Section>
      <S.SectionName>JMX Metrics</S.SectionName>
      <div>
        <Button
          buttonSize="M"
          buttonType="primary"
          onClick={(e) => showJMXMetrics(e)}
        >
          {!newJMXMetrics ? 'Configure JMX Metrics' : 'Remove from config'}
        </Button>
        {newJMXMetrics && (
          <>
            <S.PartStyled>
              <label htmlFor="JMXMetrics.port">Port</label>{' '}
              <S.InputsContainer>
                <Input
                  id="JMXMetrics.port"
                  name="JMXMetrics.port"
                  type="number"
                />
              </S.InputsContainer>
              <FormError>
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="JMXMetrics.port"
                />
              </FormError>
            </S.PartStyled>
            <S.PartStyled>
              <S.CheckboxWrapper>
                <input
                  {...methods.register('JMXMetrics.isSSL')}
                  id="JMXMetrics.isSSL"
                  type="checkbox"
                />

                <label htmlFor="JMXMetrics.isSSL">SSL</label>
              </S.CheckboxWrapper>
              <FormError>
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="JMXMetrics.isSSL"
                />
              </FormError>
            </S.PartStyled>
            {isSSLisAuth[0] && (
              <>
                <S.PartStyled>
                  <S.InputsContainer>
                    <S.InputWrapper>
                      <S.ItemLabelRequired>
                        <label htmlFor="JMXMetrics.truststoreLocation">
                          Truststore location
                        </label>{' '}
                      </S.ItemLabelRequired>
                      <Input
                        id="JMXMetrics.truststoreLocation"
                        name="JMXMetrics.truststoreLocation"
                        type="text"
                      />
                      <FormError>
                        <ErrorMessage
                          errors={methods.formState.errors}
                          name="JMXMetrics.truststoreLocation"
                        />
                      </FormError>
                    </S.InputWrapper>
                    <S.InputWrapper>
                      <S.ItemLabelRequired>
                        <label htmlFor="JMXMetrics.truststorePassword">
                          Truststore password
                        </label>{' '}
                      </S.ItemLabelRequired>
                      <Input
                        id="JMXMetrics.truststorePassword"
                        name="JMXMetrics.truststorePassword"
                        type="password"
                      />
                      <FormError>
                        <ErrorMessage
                          errors={methods.formState.errors}
                          name="JMXMetrics.truststorePassword"
                        />
                      </FormError>
                    </S.InputWrapper>
                  </S.InputsContainer>
                </S.PartStyled>
                <S.PartStyled>
                  <S.InputsContainer>
                    <S.InputWrapper>
                      <S.ItemLabel>
                        <label htmlFor="JMXMetrics.keystoreLocation">
                          Keystore location
                        </label>{' '}
                      </S.ItemLabel>
                      <Input
                        id="JMXMetrics.keystoreLocation"
                        name="JMXMetrics.keystoreLocation"
                        type="text"
                      />
                      <FormError>
                        <ErrorMessage
                          errors={methods.formState.errors}
                          name="JMXMetrics.keystoreLocation"
                        />
                      </FormError>
                    </S.InputWrapper>
                    <S.InputWrapper>
                      <S.ItemLabel>
                        <label htmlFor="JMXMetrics.keystorePassword">
                          Keystore Password
                        </label>{' '}
                      </S.ItemLabel>
                      <Input
                        id="JMXMetrics.keystorePassword"
                        name="JMXMetrics.keystorePassword"
                        type="password"
                      />
                      <FormError>
                        <ErrorMessage
                          errors={methods.formState.errors}
                          name="JMXMetrics.keystorePassword"
                        />
                      </FormError>
                    </S.InputWrapper>
                    <S.InputWrapper>
                      <S.ItemLabel>
                        <label htmlFor="JMXMetrics.keystoreKeyPassword">
                          Keystore key password
                        </label>{' '}
                      </S.ItemLabel>
                      <Input
                        id="JMXMetrics.keystoreKeyPassword"
                        name="JMXMetrics.keystoreKeyPassword"
                        type="text"
                      />
                      <FormError>
                        <ErrorMessage
                          errors={methods.formState.errors}
                          name="JMXMetrics.keystoreKeyPassword"
                        />
                      </FormError>
                    </S.InputWrapper>
                  </S.InputsContainer>
                </S.PartStyled>
              </>
            )}
            <S.PartStyled>
              <S.CheckboxWrapper>
                <input
                  {...methods.register('JMXMetrics.isAuth')}
                  id="JMXMetrics.isAuth"
                  type="checkbox"
                />

                <label htmlFor="JMXMetrics.isAuth">Authentication</label>
              </S.CheckboxWrapper>
              <FormError>
                <ErrorMessage
                  errors={methods.formState.errors}
                  name="JMXMetrics.isAuth"
                />
              </FormError>
            </S.PartStyled>
            {isSSLisAuth[1] && (
              <S.PartStyled>
                <S.InputsContainer>
                  <S.InputWrapper>
                    <S.ItemLabelRequired>
                      <label htmlFor="JMXMetrics.username">Username</label>{' '}
                    </S.ItemLabelRequired>
                    <Input
                      id="JMXMetrics.username"
                      type="text"
                      name="JMXMetrics.username"
                    />
                    <FormError>
                      <ErrorMessage
                        errors={methods.formState.errors}
                        name="JMXMetrics.username"
                      />
                    </FormError>
                  </S.InputWrapper>
                  <S.InputWrapper>
                    <S.ItemLabelRequired>
                      <label htmlFor="JMXMetrics.password">Password</label>{' '}
                    </S.ItemLabelRequired>
                    <Input
                      id="JMXMetrics.password"
                      type="password"
                      name="JMXMetrics.password"
                    />
                    <FormError>
                      <ErrorMessage
                        errors={methods.formState.errors}
                        name="JMXMetrics.password"
                      />
                    </FormError>
                  </S.InputWrapper>
                </S.InputsContainer>
              </S.PartStyled>
            )}
          </>
        )}
      </div>
    </S.Section>
  );
};
export default JMXMetrics;

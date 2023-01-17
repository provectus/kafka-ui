import React from 'react';
import { Button } from 'components/common/Button/Button';
import Input from 'components/common/Input/Input';
import PlusIcon from 'components/common/Icons/PlusIcon';

import * as S from './WizardForm.styled';

// import useAppParams from 'lib/hooks/useAppParams';
// import { Controller, useForm } from 'react-hook-form';
// import { ErrorMessage } from '@hookform/error-message';
// import { yupResolver } from '@hookform/resolvers/yup';
// import { RouterParamsClusterConnectConnector } from 'lib/paths';
// import yup from 'lib/yupExtended';
// import Editor from 'components/common/Editor/Editor';
// import { Button } from 'components/common/Button/Button';
// import {
//   useConnectorConfig,
//   useUpdateConnectorConfig,
// } from 'lib/hooks/api/kafkaConnect';
// import {
//   ConnectEditWarningMessageStyled,
//   ConnectEditWrapperStyled,
// } from 'components/Connect/Details/Config/Config.styled';
//
// const validationSchema = yup.object().shape({
//   config: yup.string().required().isJsonObject(),
// });
//
// interface FormValues {
//   config: string;
// }

const Wizard: React.FC = () => {
  // const routerParams = useAppParams<RouterParamsClusterConnectConnector>();
  // const { data: config } = useConnectorConfig(routerParams);
  // const mutation = useUpdateConnectorConfig(routerParams);
  //
  // const {
  //   handleSubmit,
  //   control,
  //   reset,
  //   formState: { isDirty, isSubmitting, isValid, errors },
  //   setValue,
  // } = useForm<FormValues>({
  //   mode: 'onTouched',
  //   resolver: yupResolver(validationSchema),
  //   defaultValues: {
  //     config: JSON.stringify(config, null, '\t'),
  //   },
  // });
  //
  // React.useEffect(() => {
  //   if (config) {
  //     setValue('config', JSON.stringify(config, null, '\t'));
  //   }
  // }, [config, setValue]);
  //
  // const onSubmit = async (values: FormValues) => {
  //   const requestBody = JSON.parse(values.config.trim());
  //   await mutation.mutateAsync(requestBody);
  //   reset(values);
  // };
  //
  // const hasCredentials = JSON.stringify(config, null, '\t').includes(
  //   '"******"'
  // );

  return (
    <div style={{ padding: '15px' }}>
      <Button
        style={{ marginBottom: '0.75rem' }}
        buttonSize="M"
        buttonType="primary"
      >
        Back
      </Button>
      <hr />
      <form>
        <S.Section>
          <S.SectionName>Kafka Cluster</S.SectionName>
          <S.Action>
            <S.ActionItem>
              <S.ItemStyled>
                <label htmlFor="clusterName">Cluster Name</label>{' '}
                <S.P>
                  this name will help you recognize the cluster in the
                  application interface
                </S.P>
              </S.ItemStyled>
              <Input id="clusterName" type="text" />
              <S.P style={{ color: 'red' }}>
                Cluster name must be at least 3 characters
              </S.P>
            </S.ActionItem>
            <S.ActionItem>
              <S.ReadOnly>
                <Input id="readonly" type="checkbox" className="checkbox" />
                <div>
                  <label htmlFor="readonly">Read-only mode</label>{' '}
                  <p>
                    allows you to run an application in read-only mode for a
                    specific cluster
                  </p>
                </div>
              </S.ReadOnly>
            </S.ActionItem>
            <S.ActionItem>
              <S.ItemStyled>
                <label
                  className="block text-sm font-medium text-gray-700 whitespace-nowrap mr-2 svelte-55p6jf required"
                  htmlFor="bootstrapServers"
                >
                  Bootstrap Servers
                </label>{' '}
                <S.P>the list of Kafka brokers that you want to connect to</S.P>
              </S.ItemStyled>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <Input
                    id="bootstrapServers.0.host"
                    placeholder="Host"
                    type="text"
                  />
                </div>
                <div style={{ paddingLeft: '.7rem' }}>
                  <Input
                    id="bootstrapServers.0.port"
                    type="number"
                    placeholder="Port"
                  />
                </div>
                <div style={{ paddingLeft: '.7rem' }}>
                  <Button
                    buttonSize="S"
                    buttonType="primary"
                    style={{ borderRadius: '20px' }}
                  >
                    <PlusIcon />
                    {/* <svg */}
                    {/*  xmlns="http://www.w3.org/2000/svg" */}
                    {/*  className="h-4 w-4" */}
                    {/*  fill="none" */}
                    {/*  viewBox="0 0 24 24" */}
                    {/*  stroke="currentColor" */}
                    {/* > */}
                    {/*  <path */}
                    {/*    strokeLinecap="round" */}
                    {/*    strokeLinejoin="round" */}
                    {/*    strokeWidth="3" */}
                    {/*    d="M12,18 V6 M18,12 H6" */}
                    {/*  /> */}
                    {/* </svg> */}
                  </Button>
                </div>
              </div>
              <S.P style={{ color: 'red' }}>required</S.P>
            </S.ActionItem>
            <S.ActionItem>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  id="sharedConfluentCloudCluster"
                  type="checkbox"
                  className="checkbox"
                />
                <label
                  style={{ paddingLeft: '.7rem' }}
                  htmlFor="sharedConfluentCloudCluster"
                >
                  Shared confluent cloud cluster
                </label>
              </div>
            </S.ActionItem>
          </S.Action>
        </S.Section>
        <S.Section>
          <S.SectionName className="text-lg font-medium leading-6 text-gray-900">
            Authentication
          </S.SectionName>
          <div className="md:mt-0 md:col-span-3">
            <div className="sm:overflow-hidden h-full">
              <div className="px-4 py-5">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-3">
                    <select
                      id="authMethod"
                      name="authMethod"
                      className="select select-bordered w-full"
                    >
                      <option value="None">None</option>
                      <option value="SASL_SSL">SASL_SSL</option>
                      <option value="SASL_PLAINTEXT">SASL_PLAINTEXT</option>
                    </select>
                  </div>
                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="securedWithSSL"
                          name="securedWithSSL"
                          type="checkbox"
                          className="checkbox"
                        />
                      </div>
                      <div className="ml-3">
                        <label
                          className="block text-sm font-medium text-gray-700 whitespace-nowrap mr-2 svelte-55p6jf"
                          htmlFor="securedWithSSL"
                        >
                          Secured with SSL
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </S.Section>
        <S.Section>
          <S.SectionName className="text-lg font-medium leading-6 text-gray-900">
            Schema Registry
          </S.SectionName>
          <div className="md:mt-0 md:col-span-3">
            <div className="sm:overflow-hidden h-full">
              <div className="px-4 py-5">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-5">
                    <Button buttonSize="M" buttonType="primary">
                      Add Schema Registry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </S.Section>
        <S.Section>
          <S.SectionName className="text-lg font-medium leading-6 text-gray-900">
            Kafka Connect
          </S.SectionName>
          <div className="md:mt-0 md:col-span-3">
            <div className="sm:overflow-hidden h-full">
              <div className="px-4 py-5">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-5">
                    <Button buttonSize="M" buttonType="primary">
                      Add Kafka Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </S.Section>
        <S.Section>
          <S.SectionName className="text-lg font-medium leading-6 text-gray-900">
            JMX Metrics
          </S.SectionName>
          <div className="md:mt-0 md:col-span-3">
            <div className="sm:overflow-hidden h-full">
              <div className="px-4 py-5">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-5">
                    <Button buttonSize="M" buttonType="primary">
                      Configure JMX Metrics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </S.Section>
        <div style={{ paddingTop: '10px' }}>
          <div
            style={{
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            <Button buttonSize="M" buttonType="primary">
              Cancel
            </Button>
            <Button
              style={{ marginLeft: '15px' }}
              type="submit"
              buttonSize="M"
              buttonType="primary"
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
    // <ConnectEditWrapperStyled>
    //   {hasCredentials && (
    //     <ConnectEditWarningMessageStyled>
    //       Please replace ****** with the real credential values to avoid
    //       accidentally breaking your connector config!
    //     </ConnectEditWarningMessageStyled>
    //   )}
    //   <form onSubmit={handleSubmit(onSubmit)} aria-label="Edit connect form">
    //     <div>
    //       <Controller
    //         control={control}
    //         name="config"
    //         render={({ field }) => (
    //           <Editor {...field} readOnly={isSubmitting} />
    //         )}
    //       />
    //     </div>
    //     <div>
    //       <ErrorMessage errors={errors} name="config" />
    //     </div>
    //     <Button
    //       buttonSize="M"
    //       buttonType="primary"
    //       type="submit"
    //       disabled={!isValid || isSubmitting || !isDirty}
    //     >
    //       Submit
    //     </Button>
    //   </form>
    // </ConnectEditWrapperStyled>
  );
};

export default Wizard;

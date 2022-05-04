<script type="ts">
  import type { FormProps } from "src/types";
  import { createForm } from "svelte-forms-lib";
  import BootstrapServers from "./BootstrapServers.svelte";
  import CheckboxField from "./CheckboxField.svelte";
  import Hr from "./Hr.svelte";
  import Label from "./Label.svelte";
  import PasswordField from "./PasswordField.svelte";
  import SelectField from "./SelectField.svelte";
  import TextField from "./TextField.svelte";
  import FormSection from "./FormSection.svelte";

  const { form, handleSubmit } = createForm<FormProps>({
    initialValues: {
      clusterName: "",
      readonly: false,
      bootstrapServers: [
        {
          host: "",
          port: undefined,
        },
      ],
      sharedConfluentCloudCluster: false,
      securedWithSSL: false,
      selfSignedCA: false,
      selfSignedCATruststoreLocation: undefined,
      selfSignedCATruststorePassword: undefined,
      securedWithAuth: false,
      authMethod: 'None',
      saslJaasConfig: undefined,
      saslMechanism: undefined,
      sslTruststoreLocation: undefined,
      sslTruststorePassword: undefined,
      sslKeystoreLocation: undefined,
      sslKeystorePassword: undefined,
      useSpecificIAMProfile: false,
      IAMProfile: undefined,
      schemaRegistryEnabled: false,
      schemaRegistryURL: undefined,
      schemaRegistrySecuredWithAuth: false,
      schemaRegistryUsername: undefined,
      schemaRegistryPassword: undefined,
      kafkaConnectEnabled: false,
      kafkaConnectURL: undefined,
      kafkaConnectSecuredWithAuth: false,
      kafkaConnectUsername: undefined,
      kafkaConnectPassword: undefined,
      jmxEnabled: false,
      jmxURL: undefined,
      jmxSSL: false,
      jmxSSLTruststoreLocation: undefined,
      jmxSSLTruststorePassword: undefined,
      jmxSSLKeystoreLocation: undefined,
      jmxSSLKeystorePassword: undefined,
      jmxSecuredWithAuth: false,
      jmxUsername: undefined,
      jmxPassword: undefined,
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });
</script>

<form on:submit={handleSubmit}>
  <div class="md:grid md:grid-cols-3">
    <FormSection title="Cluster" first>
      <svelte:fragment slot="hint">
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </svelte:fragment>
      <svelte:fragment slot="form">
        <TextField
          name="clusterName"
          label="Cluster Name"
          bind:value={$form.clusterName}
          placeholder="local"
          hint="this name will help you recognize the cluster in the application interface"
        />
        <CheckboxField
          name="readonly"
          label="Read-only mode"
          bind:checked={$form.readonly}
          hint="allows you to run an application in read-only mode for a specific cluster"
        />

        <Hr />
        <div class="col-span-6">
          <div class="flex flex-wrap items-baseline">
            <Label forTarget="bootstrapServers">Bootstrap Servers</Label>
            <p class="text-xs text-gray-500">
              the list of Kafka brokers that you want to connect to
            </p>
          </div>
          <BootstrapServers bind:value={$form.bootstrapServers} />
        </div>
        <CheckboxField
          name="sharedConfluentCloudCluster"
          label="Is your cluster a shared confluent cloud cluster?"
          bind:checked={$form.sharedConfluentCloudCluster}
        />
      </svelte:fragment>
    </FormSection>

    <FormSection title="SSL">
      <svelte:fragment slot="form">
        <CheckboxField
          name="securedWithSSL"
          label="Is your cluster secured with SSL?"
          bind:checked={$form.securedWithSSL}
        />
        {#if $form.securedWithSSL}
          <CheckboxField
            name="selfSignedCA"
            label="Do you have self-signed certificate?"
            bind:checked={$form.selfSignedCA}
          />
          {#if $form.selfSignedCA}
            <TextField
              name="selfSignedCATruststoreLocation"
              label="Truststore location"
              containerClass="col-span-3"
              placeholder="/var/private/ssl/client.truststore.jks"
              bind:value={$form.selfSignedCATruststoreLocation}
            />
            <PasswordField
              name="selfSignedCATruststorePassword"
              label="Truststore password"
              bind:value={$form.selfSignedCATruststorePassword}
            />
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>

    <FormSection title="Authentication">
      <svelte:fragment slot="form">
        <CheckboxField
          name="securedWithAuth"
          label="Is your cluster secured with authentication?"
          bind:checked={$form.securedWithAuth}
        />
        {#if $form.securedWithAuth}
          <SelectField
            name="authMethod"
            bind:value={$form.authMethod}
            label="Authentication method"
            containerClass="col-span-2"
          >
            <option>None</option>
            <option>SASL</option>
            <option>SSL</option>
            <option>IAM</option>
          </SelectField>
          {#if $form.authMethod === "SASL"}
            <TextField
              name="saslMechanism"
              label="sasl_mechanism"
              bind:value={$form.saslMechanism}
            />
            <TextField
              name="saslJaasConfig"
              label="sasl.jaas.config"
              bind:value={$form.saslJaasConfig}
            />
          {:else if $form.authMethod === "SSL"}
            <TextField
              name="sslTruststoreLocation"
              label="Truststore location"
              containerClass="col-start-1 col-span-3"
              bind:value={$form.sslTruststoreLocation}
            />
            <PasswordField
              name="sslTruststorePassword"
              label="Truststore password"
              bind:value={$form.sslTruststorePassword}
            />
            <TextField
              name="sslKeystoreLocation"
              label="Keystore location"
              containerClass="col-span-3"
              bind:value={$form.sslKeystoreLocation}
            />
            <PasswordField
              name="sslKeystorePassword"
              label="Keystore password"
              bind:value={$form.sslKeystorePassword}
            />
          {:else if $form.authMethod === "IAM"}
            <CheckboxField
              name="useSpecificIAMProfile"
              label="Use specific profile?"
              bind:checked={$form.useSpecificIAMProfile}
            />
            {#if $form.useSpecificIAMProfile}
              <TextField
                name="IAMProfile"
                label="Profile name"
                bind:value={$form.IAMProfile}
              />
            {/if}
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>

    <FormSection title="Schema Registry">
      <svelte:fragment></svelte:fragment>
      <svelte:fragment slot="form">
        <CheckboxField
          name="schemaRegistryEnabled"
          label="Do you have Schema Registry?"
          bind:checked={$form.schemaRegistryEnabled}
        />
        {#if $form.schemaRegistryEnabled}
          <TextField
            name="schemaRegistryURL"
            label="URL"
            hint=""
            placeholder="http://localhost:8081"
            bind:value={$form.schemaRegistryURL}
          />
          <CheckboxField
            name="schemaRegistrySecuredWithAuth"
            label="Schema registry is secured with auth?"
            bind:checked={$form.schemaRegistrySecuredWithAuth}
          />
          {#if $form.schemaRegistrySecuredWithAuth}
            <TextField
              name="schemaRegistryUsername"
              label="Username"
              containerClass="col-span-3"
              bind:value={$form.schemaRegistryUsername}
            />
            <PasswordField
              name="schemaRegistryPassword"
              label="Password"
              bind:value={$form.schemaRegistryPassword}
            />
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>

    <FormSection title="Kafka Connect">
      <svelte:fragment slot="form">
        <CheckboxField
          name="kafkaConnectEnabled"
          label="Do you have Kafka Connect?"
          bind:checked={$form.kafkaConnectEnabled}
        />
        {#if $form.kafkaConnectEnabled}
          <TextField
            name="kafkaConnectURL"
            label="Kafka Connect URL"
            bind:value={$form.kafkaConnectURL}
          />
          <CheckboxField
            name="kafkaConnectSecuredWithAuth"
            label="Kafka Connect is secured with auth?"
            bind:checked={$form.kafkaConnectSecuredWithAuth}
          />
          {#if $form.kafkaConnectSecuredWithAuth}
            <TextField
              name="kafkaConnectUsername"
              label="Username"
              containerClass="col-span-3"
              bind:value={$form.kafkaConnectUsername}
            />
            <PasswordField
              name="kafkaConnectPassword"
              label="Password"
              bind:value={$form.kafkaConnectPassword}
            />
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>

    <FormSection title="JMX">
      <svelte:fragment slot="form">
        <CheckboxField
          name="jmxEnabled"
          label="JMX Enabled"
          bind:checked={$form.jmxEnabled}
        />
        {#if $form.jmxEnabled}
          <TextField name="jmxURL" label="JMX URL" bind:value={$form.jmxURL} />
          <CheckboxField
            name="jmxSSL"
            label="JMX SSL"
            bind:checked={$form.jmxSSL}
          />
          {#if $form.jmxSSL}
            <TextField
              name="jmxSSLTruststoreLocation"
              label="Truststore location"
              containerClass="col-start-1 col-span-3"
              bind:value={$form.jmxSSLTruststoreLocation}
            />
            <PasswordField
              name="jmxSSLTruststorePassword"
              label="Truststore password"
              bind:value={$form.jmxSSLTruststorePassword}
            />
            <TextField
              name="jmxSSLKeystoreLocation"
              label="Keystore location"
              containerClass="col-span-3"
              bind:value={$form.jmxSSLKeystoreLocation}
            />
            <PasswordField
              name="jmxSSLKeystorePassword"
              label="Keystore password"
              bind:value={$form.jmxSSLKeystorePassword}
            />
          {/if}

          <CheckboxField
            name="jmxSecuredWithAuth"
            label="JMX is secured with auth?"
            bind:checked={$form.jmxSecuredWithAuth}
          />
          {#if $form.jmxSecuredWithAuth}
            <TextField
              name="jmxUsername"
              label="Username"
              containerClass="col-span-3"
              bind:value={$form.jmxUsername}
            />
            <PasswordField
              name="jmxPassword"
              label="Password"
              bind:value={$form.jmxPassword}
            />
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>
    <div class="md:mt-0 md:col-span-2 md:col-start-2">
      <div class="md:shadow md:border-b-gray-200 md:border-b-1 rounded-b-md">
        <div class="px-4 py-5 space-y-6 sm:p-4 bg-grey-50 text-right">
          <button
            type="submit"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate Docker Command
          </button>
        </div>
      </div>
    </div>
  </div>
</form>

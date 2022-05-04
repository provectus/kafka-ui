<script type="ts">
  import type { FormProps } from "src/types";
  import { createForm } from "svelte-forms-lib";
  import BootstrapServers from "./BootstrapServers.svelte";
  import CheckboxField from "./CheckboxField.svelte";
  import Hr from "./Hr.svelte";
  import Label from "./Label.svelte";
  import PasswordField from "./PasswordField.svelte";
  import H4 from "./H4.svelte";
  import SelectField from "./SelectField.svelte";
  import TextField from "./TextField.svelte";

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
      authMethod: undefined,
      saslJaasConfig: undefined,
      saslMechanism: undefined,
      sslTruststoreLocation: undefined,
      sslTruststorePassword: undefined,
      sslKeystoreLocation: undefined,
      sslKeystorePassword: undefined,
      useSpecificIAMProfile: false,
      IAMProfile: undefined,
      schemaRegistryURL: undefined,
      schemaRegistrySecuredWithAuth: false,
      schemaRegistryUsername: undefined,
      schemaRegistryPassword: undefined,
      kafkaConnectURL: undefined,
      kafkaConnectSecuredWithAuth: false,
      kafkaConnectUsername: undefined,
      kafkaConnectPassword: undefined,
    },
    onSubmit: (values) => {
      console.log(JSON.stringify(values));
    },
  });
</script>

<form on:submit={handleSubmit}>
  <div class="shadow sm:rounded-md sm:overflow-hidden">
    <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
      <div class="grid grid-cols-6 gap-6">
        <H4>Cluster</H4>
        <TextField
          name="clusterName"
          label="Cluster Name"
          bind:value={$form.clusterName}
        />
        <CheckboxField
          name="readonly"
          label="Readonly?"
          bind:checked={$form.readonly}
        />

        <Hr />
        <div class="col-span-6">
          <Label forTarget="bootstrapServers">Bootstrap Servers</Label>
          <BootstrapServers bind:value={$form.bootstrapServers} />
        </div>
        <CheckboxField
          name="sharedConfluentCloudCluster"
          label="Is it shared confluent cloud cluster?"
          bind:checked={$form.sharedConfluentCloudCluster}
        />

        <Hr />
        <H4>SSL</H4>
        <CheckboxField
          name="securedWithSSL"
          label="Is it secured with SSL?"
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
              bind:value={$form.selfSignedCATruststoreLocation}
            />
            <PasswordField
              name="selfSignedCATruststorePassword"
              label="Truststore password"
              bind:value={$form.selfSignedCATruststorePassword}
            />
          {/if}
        {/if}

        <Hr />
        <H4>Authentication</H4>
        <CheckboxField
          name="securedWithAuth"
          label="Is it secured with authentication?"
          bind:checked={$form.securedWithAuth}
        />
        {#if $form.securedWithAuth}
          <SelectField
            name="authMethod"
            bind:value={$form.authMethod}
            label="Authentication method"
            containerClass="col-span-2"
          >
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
        <Hr />

        <H4>Schema Registry</H4>
        <TextField
          name="schemaRegistryURL"
          label="Schema registry URL"
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
        <Hr />

        <H4>Kafka Connect</H4>
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
        <Hr />

        <H4>JMX Metrics</H4>
        <CheckboxField
          name="jmxMetrics"
          label="JMX Metrics"
          bind:checked={$form.jmxMetrics}
        />
        {#if $form.jmxMetrics}
          <TextField
            name="jmxURL"
            label="JMX URL"
            bind:value={$form.jmxURL}
          />
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
      </div>
    </div>

    <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
      <button
        type="submit"
        class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit
      </button>
    </div>
  </div>
</form>

<p class="text-xs">
  {JSON.stringify($form)}
</p>

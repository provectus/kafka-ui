<script type="ts">
  import type { FormProps } from "src/lib/types";
  import { createForm } from "svelte-forms-lib";
  import BootstrapServers from "src/lib/components/BootstrapServers.svelte";
  import CheckboxField from "src/lib/components/CheckboxField.svelte";
  import Hr from "src/lib/components/Hr.svelte";
  import Label from "src/lib/components/Label.svelte";
  import PasswordField from "src/lib/components/PasswordField.svelte";
  import SelectField from "src/lib/components/SelectField.svelte";
  import TextField from "src/lib/components/TextField.svelte";
  import FormSection from "src/lib/components/FormSection.svelte";
  import NumberField from "src/lib/components/NumberField.svelte";
  import clusterConfigurationSchema from "src/lib/clusterConfigurationSchema";

  const { form, errors, handleSubmit, handleChange } = createForm<FormProps>({
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
      authMethod: "None",
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
      jmxPort: undefined,
      jmxSSL: false,
      jmxSSLTruststoreLocation: undefined,
      jmxSSLTruststorePassword: undefined,
      jmxSSLKeystoreLocation: undefined,
      jmxSSLKeystorePassword: undefined,
      jmxSecuredWithAuth: false,
      jmxUsername: undefined,
      jmxPassword: undefined,
    },
    validationSchema: clusterConfigurationSchema,
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
          on:change={handleChange}
          placeholder="local"
          errors={$errors.clusterName}
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
          <BootstrapServers
            bind:value={$form.bootstrapServers}
            errors={$errors.bootstrapServers}
            on:change={handleChange}
          />
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
              errors={$errors.selfSignedCATruststoreLocation}
              on:change={handleChange}
              bind:value={$form.selfSignedCATruststoreLocation}
            />
            <PasswordField
              name="selfSignedCATruststorePassword"
              label="Truststore password"
              errors={$errors.selfSignedCATruststorePassword}
              on:change={handleChange}
              bind:value={$form.selfSignedCATruststorePassword}
            />
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>

    <FormSection title="Authentication">
      <svelte:fragment slot="form">
        <SelectField
          name="authMethod"
          bind:value={$form.authMethod}
          label=""
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
            errors={$errors.saslMechanism}
            on:change={handleChange}
            bind:value={$form.saslMechanism}
          />
          <TextField
            name="saslJaasConfig"
            label="sasl.jaas.config"
            errors={$errors.saslJaasConfig}
            on:change={handleChange}
            bind:value={$form.saslJaasConfig}
          />
        {:else if $form.authMethod === "SSL"}
          <TextField
            name="sslTruststoreLocation"
            label="Truststore location"
            containerClass="col-start-1 col-span-3"
            errors={$errors.sslTruststoreLocation}
            on:change={handleChange}
            bind:value={$form.sslTruststoreLocation}
          />
          <PasswordField
            name="sslTruststorePassword"
            label="Truststore password"
            errors={$errors.sslTruststorePassword}
            bind:value={$form.sslTruststorePassword}
          />
          <TextField
            name="sslKeystoreLocation"
            label="Keystore location"
            containerClass="col-span-3"
            errors={$errors.sslKeystoreLocation}
            on:change={handleChange}
            bind:value={$form.sslKeystoreLocation}
          />
          <PasswordField
            name="sslKeystorePassword"
            label="Keystore password"
            errors={$errors.sslKeystorePassword}
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
              errors={$errors.IAMProfile}
              on:change={handleChange}
              bind:value={$form.IAMProfile}
            />
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>

    <FormSection title="Schema Registry">
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
            errors={$errors.schemaRegistryURL}
            on:change={handleChange}
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
              errors={$errors.schemaRegistryUsername}
              on:change={handleChange}
              bind:value={$form.schemaRegistryUsername}
            />
            <PasswordField
              name="schemaRegistryPassword"
              label="Password"
              errors={$errors.schemaRegistryPassword}
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
            errors={$errors.kafkaConnectURL}
            on:change={handleChange}
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
              errors={$errors.kafkaConnectUsername}
              on:change={handleChange}
              bind:value={$form.kafkaConnectUsername}
            />
            <PasswordField
              name="kafkaConnectPassword"
              label="Password"
              errors={$errors.kafkaConnectPassword}
              bind:value={$form.kafkaConnectPassword}
            />
          {/if}
        {/if}
      </svelte:fragment>
    </FormSection>

    <FormSection title="JMX Metrics">
      <svelte:fragment slot="form">
        <CheckboxField
          name="jmxEnabled"
          label="Enabled"
          bind:checked={$form.jmxEnabled}
        />
        {#if $form.jmxEnabled}
          <NumberField
            name="jmxPort"
            label="Port"
            errors={$errors.jmxPort}
            on:change={handleChange}
            bind:value={$form.jmxPort}
          />
          <CheckboxField
            name="jmxSSL"
            label="SSL"
            bind:checked={$form.jmxSSL}
          />
          {#if $form.jmxSSL}
            <TextField
              name="jmxSSLTruststoreLocation"
              label="Truststore location"
              containerClass="col-start-1 col-span-3"
              errors={$errors.jmxSSLTruststoreLocation}
              on:change={handleChange}
              bind:value={$form.jmxSSLTruststoreLocation}
            />
            <PasswordField
              name="jmxSSLTruststorePassword"
              label="Truststore password"
              errors={$errors.jmxSSLTruststorePassword}
              bind:value={$form.jmxSSLTruststorePassword}
            />
            <TextField
              name="jmxSSLKeystoreLocation"
              label="Keystore location"
              containerClass="col-span-3"
              errors={$errors.jmxSSLKeystoreLocation}
              on:change={handleChange}
              bind:value={$form.jmxSSLKeystoreLocation}
            />
            <PasswordField
              name="jmxSSLKeystorePassword"
              label="Keystore password"
              errors={$errors.jmxSSLKeystorePassword}
              bind:value={$form.jmxSSLKeystorePassword}
            />
          {/if}

          <CheckboxField
            name="jmxSecuredWithAuth"
            label="Authentication"
            bind:checked={$form.jmxSecuredWithAuth}
          />
          {#if $form.jmxSecuredWithAuth}
            <TextField
              name="jmxUsername"
              label="Username"
              containerClass="col-span-3"
              errors={$errors.jmxUsername}
              on:change={handleChange}
              bind:value={$form.jmxUsername}
            />
            <PasswordField
              name="jmxPassword"
              label="Password"
              errors={$errors.jmxPassword}
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

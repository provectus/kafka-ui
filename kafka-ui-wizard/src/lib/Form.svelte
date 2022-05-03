<script type="ts">
  import type { FormProps } from "src/types";
  import { createForm } from "svelte-forms-lib";
  import BootstrapServers from "./BootstrapServers.svelte";
  import CheckboxField from "./CheckboxField.svelte";
  import Hr from "./Hr.svelte";
  import Label from "./Label.svelte";
  import PasswordField from "./PasswordField.svelte";
  import SectionHeader from "./SectionHeader.svelte";
  import SelectField from "./SelectField.svelte";
  import TextField from "./TextField.svelte";

  const { form, handleChange, handleSubmit } = createForm<FormProps>({
    initialValues: {
      clusterName: "123",
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
        <SectionHeader>SSL</SectionHeader>
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
        <SectionHeader>Authentication</SectionHeader>
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

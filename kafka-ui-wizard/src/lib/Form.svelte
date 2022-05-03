<script type="ts">
  import type { FormProps } from 'src/types';
  import { createForm } from 'svelte-forms-lib';
import BootstrapServers from './BootstrapServers.svelte';
  import Checkbox from './Checkbox.svelte';
  import Label from './Label.svelte';
import PasswordInput from './PasswordInput.svelte';
  import TextInput from './TextInput.svelte';

  const { form, handleChange, handleSubmit } = createForm<FormProps>({
    initialValues: {
      clusterName: "123",
      readonly: false,
      bootstrapServers: [{
        host: '',
        port: undefined,
      }],
      sharedConfluentCloudCluster: false,
      securedWithSSL: false,
      selfSignedCA: false,
      selfSignedCATruststoreLocation: undefined,
      selfSignedCATruststorePassword: undefined,
      securedWithAuth: false,
    },
    onSubmit: values => {
      console.log(JSON.stringify(values));
    }
  });
</script>

<form on:submit={handleSubmit}>
  <div class="shadow sm:rounded-md sm:overflow-hidden">
    <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
      <div class="grid grid-cols-6 gap-6">
        <div class="col-span-6">
          <Label forTarget="clusterName">Cluster Name</Label>
          <TextInput
            name="clusterName"
            bind:value={$form.clusterName}
          />
        </div>
        <div class="col-span-6">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <Checkbox name="readonly" bind:checked={$form.readonly} />
            </div>
            <div class="ml-3 text-sm">
              <Label forTarget="readonly">Readonly?</Label>
              <p class="text-gray-500">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
            </div>
          </div>
        </div>

        <hr class="col-span-6" />
        <div class="col-span-6">
          <Label forTarget="bootstrapServers">Bootstrap Servers</Label>
          <BootstrapServers bind:value={$form.bootstrapServers} />
        </div>

        <div class="col-span-6">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <Checkbox name="sharedConfluentCloudCluster" bind:checked={$form.sharedConfluentCloudCluster} />
            </div>
            <div class="ml-3 text-sm">
              <Label forTarget="sharedConfluentCloudCluster">Is it shared confluent cloud cluster?</Label>
              <p class="text-gray-500">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
            </div>
          </div>
        </div>

        <hr class="col-span-6" />
        <div class="col-span-6">
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <Checkbox name="securedWithSSL" bind:checked={$form.securedWithSSL} />
            </div>
            <div class="ml-3 text-sm">
              <Label forTarget="securedWithSSL">Is it secured with SSL?</Label>
              <p class="text-gray-500">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
            </div>
          </div>
        </div>
        {#if $form.securedWithSSL}
          <div class="col-span-6">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <Checkbox name="selfSignedCA" bind:checked={$form.selfSignedCA} />
              </div>
              <div class="ml-3 text-sm">
                <Label forTarget="selfSignedCA">Do you have self-signed certificate?</Label>
                <p class="text-gray-500">Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
              </div>
            </div>
          </div>
          {#if $form.selfSignedCA}
            <div class="col-span-3">
              <Label forTarget="selfSignedCATruststoreLocation">Truststore location</Label>
              <TextInput
                name="selfSignedCATruststoreLocation"
                bind:value={$form.selfSignedCATruststoreLocation}
              />
            </div>
            <div class="col-span-3">
              <Label forTarget="selfSignedCATruststorePassword">Truststore password</Label>
              <PasswordInput
                name="selfSignedCATruststorePassword"
                bind:value={$form.selfSignedCATruststorePassword}
              />
            </div>
          {/if}
        {/if}

        <hr class="col-span-6" />

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

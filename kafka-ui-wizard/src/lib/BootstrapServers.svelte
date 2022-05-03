<script type="ts">
  import type { BootstrapServer } from "src/types";
  import TextInput from "./TextInput.svelte";

  export let value: BootstrapServer[];

  const add = () => {
    value = [...value, { host: "", port: undefined }];
  };

  const remove = (index: number) => () => {
    value = value.filter((_, j) => j !== index);
  };
</script>

{#each value as server, index}
  <div class="grid grid-cols-6 gap-3">
    <div class="col-span-3">
      <TextInput
        name={`value[${index}].host`}
        bind:value={value[index].host}
        placeholder="Host"
      />
    </div>
    <div class="col-span-1">
      <input
        id={`value[${index}].port`}
        name={`value[${index}].port`}
        type="number"
        placeholder="Port"
        bind:value={value[index].port}
        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
      />
    </div>
    <div class="col-span-2">
      {#if index === value.length - 1}
        <button
          type="button"
          on:click={add}
          class="py-2 px-4 mt-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Add
        </button>
      {/if}
      {#if value.length !== 1}
        <button
          type="button"
          on:click={remove(index)}
          class="py-2 px-4 mt-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Remove
        </button>
      {/if}
    </div>
  </div>
{/each}

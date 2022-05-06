<script type="ts">
  import Label from "./Label.svelte";

  export let name: string;
  export let value: string = "";
  export let label: string;
  export let placeholder: string = "********";
  export let errors: string;
</script>

<div class="col-span-3">
  <Label forTarget={name}>{label}</Label>
  <input
    id={name}
    {name}
    {placeholder}
    type="password"
    on:change
    bind:value
    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md {errors && 'border-red-500'}"
  />
  {#if errors}
    <p class="mt-1 text-xs text-red-700 block">{errors}</p>
  {/if}
</div>

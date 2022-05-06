<script type="ts">
  import Label from "./Label.svelte";

  export let name: string;
  export let value: string = "";
  export let placeholder: string = "";
  export let label: string;
  export let containerClass: string = "col-span-6";
  export let hint: string = "";
  export let errors: string;
</script>

<div class={containerClass}>
  <div class="flex flex-wrap items-baseline">
    <Label forTarget={name}>{label}</Label>
    {#if hint}
      <p class="text-xs text-gray-500 block">
        {hint}
      </p>
    {/if}
  </div>
  <input
    id={name}
    {name}
    {placeholder}
    type="text"
    bind:value
    on:change
    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full text-sm border border-gray-300 rounded-md {errors && 'border-red-500'}"
  />
  {#if errors}
    <p class="mt-1 text-xs text-red-700 block">{errors}</p>
  {/if}
</div>

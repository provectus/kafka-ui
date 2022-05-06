<script type="ts">
  import Label from "./Label.svelte";

  export let name: string;
  export let value: number;
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
    type="number"
    bind:value
    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block text-sm border border-gray-300 rounded-md w-20 {errors && 'border-red-500'}"
  />
  {#if errors}
    <p class="mt-1 text-xs text-red-700 block">{errors}</p>
  {/if}
</div>

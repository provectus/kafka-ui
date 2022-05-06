<script type="ts">
  import Label from "./Label.svelte";

  export let value: string;
  export let name: string;
  export let containerClass: string = "col-span-6";
  export let label: string;
</script>

<div class={containerClass}>
  <Label forTarget={name}>{label}</Label>
  <select
    id={name}
    {name}
    bind:value
    class="mt-1 w-full block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
  >
    <slot />
  </select>
</div>

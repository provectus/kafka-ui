<script type="ts">
  import Label from "./Label.svelte";

  export let name: string;
  export let value: string;
  export let placeholder: string = "";
  export let label: string;
  export let containerClass: string = "col-span-6";
</script>

<div class={containerClass}>
  <Label forTarget={name}>{label}</Label>
  <input
    id={name}
    {name}
    {placeholder}
    type="text"
    bind:value
    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
  />
</div>

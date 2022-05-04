<script type="ts">
  import Label from "./Label.svelte";

  export let name: string;
  export let value: string = "";
  export let label: string;
  export let placeholder: string = "********";
</script>

<div class="col-span-3">
  <Label forTarget={name}>{label}</Label>
  <input
    id={name}
    {name}
    {placeholder}
    type="password"
    bind:value
    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
  />
</div>

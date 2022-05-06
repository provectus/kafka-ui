<script type="ts">
  import Label from "./Label.svelte";

  export let name: string;
  export let checked: boolean;
  export let label: string;
  export let hint: string = undefined;
</script>

<div class="col-span-6">
  <div class="flex items-start">
    <div class="flex items-center h-5">
      <input
        id={name}
        {name}
        type="checkbox"
        bind:checked
        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
      />
    </div>
    <div class="ml-3 text-sm">
      <Label forTarget={name}>{label}</Label>
      {#if hint}
        <p class="text-sm text-gray-500">{hint}</p>
      {/if}
    </div>
  </div>
</div>

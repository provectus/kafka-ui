<script type="ts">
  import Label from "./Label.svelte";

  export let name: string;
  export let checked: boolean;
  export let label: string;
  export let hint: string =
    "Lorem ipsum dolor, sit amet consectetur adipisicing elit.";
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
      <p class="text-gray-500">{hint}</p>
    </div>
  </div>
</div>

<script type="ts">
  export let name: string;
  export let value: string;
  export let placeholder: string = "";
</script>

<input
  id={name}
  {name}
  {placeholder}
  type="text"
  bind:value
  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
/>

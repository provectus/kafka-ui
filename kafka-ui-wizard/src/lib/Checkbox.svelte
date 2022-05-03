<script type="ts">
  export let name: string;
  export let checked: boolean;
</script>

<input
  id={name}
  name={name}
  type="checkbox"
  bind:checked
  class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
/>

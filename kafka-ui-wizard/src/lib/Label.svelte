<script type="ts">
  export let forTarget: string;
</script>

<label class="block text-sm font-medium text-gray-700 whitespace-nowrap mr-2" for={forTarget}>
  <slot />
</label>

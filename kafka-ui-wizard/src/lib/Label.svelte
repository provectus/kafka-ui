<script type="ts">
  export let forTarget: string;
</script>

<label
  class="block text-sm font-medium text-gray-700"
  for={forTarget}
>
  <slot></slot>
</label>

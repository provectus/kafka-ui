<script type="ts">
  import H3 from "./H3.svelte";

  export let title: string;
  export let first: boolean = false;

  let cxContent = `md:shadow sm:overflow-hidden border-t border-gray-200 md:border-b-gray-200 sm:border-b ${
    first && "md:rounded-t-md"
  }`;
</script>

<div class="md:col-span-1">
  <div class="px-4 pt-6">
    <H3>{title}</H3>
    <p class="mt-1 text-sm text-gray-500">
      <slot name="hint" />
    </p>
  </div>
</div>
<div class="mt-5 md:mt-0 md:col-span-2">
  <div class={cxContent}>
    <div class="px-4 py-5 space-y-6 sm:p-6 bg-white">
      <div class="grid grid-cols-6 gap-6">
        <slot name="form" />
      </div>
    </div>
  </div>
</div>

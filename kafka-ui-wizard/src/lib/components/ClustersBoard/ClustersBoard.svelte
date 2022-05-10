<script lang="ts">
  import { appStore, editableConfigID } from "../../../stores";

  let allValid = false;
  $: {
    allValid = !$appStore.find(({ isValid }) => !isValid)
    console.log($appStore);
  }
</script>

<div class="grid sm:grid-flow-col sm:auto-cols-max gap-4">
  {#each $appStore as { config }, index}
    <div
      class="rounded-xl sm:w-56 sm:h-44 shadow-md p-5 pb-3 border border-gray-50 bg-white flex flex-col justify-between"
    >
      <div>
        <p class="text-gray-400 text-xs">Cluster Name:</p>
        <p
          title={config.clusterName}
          class="text-gray-700 text-lg text-ellipsis overflow-hidden"
        >
          {config.clusterName}
        </p>
      </div>
      <div class="sm:text-xs pt-2 flex gap-1 justify-end">
        <button
          class="bg-gray-100 hover:bg-gray-100 py-1 px-2 rounded disabled:opacity-30"
          on:click={() => appStore.review(index)}
          disabled={$editableConfigID === index}
        >
          Review
        </button>
        <button
          class="bg-gray-100 hover:bg-gray-100 py-1 px-2 rounded disabled:opacity-30"
          on:click={() => appStore.copy(index)}
          disabled={!allValid}
        >
          Copy
        </button>
        <button
          class="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded disabled:opacity-30"
          on:click={() => appStore.remove(index)}
        >
          Remove {index}
        </button>
      </div>
    </div>
  {/each}
  {#if allValid}
    <div
      on:click={appStore.addNew}
      title="Configure new cluster"
      class="sm:w-56 sm:h-44 rounded-xl border-4 border-dashed border-gray-300 bg-slate-200 opacity-50 flex justify-center items-center cursor-pointer hover:opacity-70"
    >
      <div class="text-gray-400 text-7xl hidden sm:block">+</div>
      <div class="text-gray-400 p-5 text-xl block sm:hidden">
        + Add new cluster configuration
      </div>
    </div>
  {/if}
</div>

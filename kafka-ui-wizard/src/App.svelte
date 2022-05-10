<script lang="ts">
  import "./app.css";
  import Form from "./lib/components/Form.svelte";
  import H1 from "./lib/components/H1.svelte";
  import ClustersBoard from "./lib/components/ClustersBoard/ClustersBoard.svelte";
  import { appStore, editableConfigID } from "./stores";

  $: {
    console.log('editableConfigID', $editableConfigID);
    console.log('Store', $appStore);
  }
</script>

<main class="container mx-auto px-5 py-10">
  <H1>Kafka UI Wizard</H1>
  <ClustersBoard />

  {#if $editableConfigID > -1}
    <Form />
  {/if}
  <pre>
    TODO:
      1. Custom validation of names
      2. status -> isValid
  </pre>

</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>

<script lang="ts">
  import "./app.css";
  import Form from "./lib/components/Form.svelte";
  import H1 from "./lib/components/H1.svelte";
  import H2 from "./lib/components/H2.svelte";
</script>

<main class="container mx-auto px-5 py-10">
  <H1>Kafka UI Wizard</H1>
  <H2>New cluster</H2>

  <div class="rounded-lg bg-gray-100 ring-1 ring-gray-300">
    <div class="max-w-7xl mx-auto md:pt-6 md:py-6 md:px-6 lg:px-8">
      <Form />
    </div>
  </div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>

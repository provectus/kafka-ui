<script lang="ts">
  import Form from "./lib/Form.svelte";
  import "./app.css";
  import H1 from "./lib/H1.svelte";
  import H2 from "./lib/H2.svelte";
  import H3 from "./lib/H3.svelte";
</script>

<main class="container mx-auto px-5 py-10">
  <H1>Kafka UI Wizard</H1>
  <H2>New cluster</H2>

  <div class="rounded-lg bg-gray-100 ring-1 ring-gray-900 ring-opacity-5">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <H3>Instruction</H3>
            <p class="mt-1 text-sm text-gray-600">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Praesentium placeat voluptatem, ad illo impedit eos.
              Reprehenderit, reiciendis. Reprehenderit obcaecati, doloribus
              error non consequuntur, eligendi, ab saepe suscipit veritatis
              pariatur officiis?
            </p>
          </div>
        </div>
        <div class="mt-5 md:mt-0 md:col-span-2">
          <Form />
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  :root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }
</style>

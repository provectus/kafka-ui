<script lang="ts">
  import Form from "./lib/Form.svelte";
  import "./app.css";
</script>

<main class="container mx-auto px-5 py-10">
  <h1 class="order-1 text-gray-900 text-3xl font-extrabold tracking-tight mt-2 mb-8">Kafka UI Wizard</h1>
  <h2 class="font-medium text-gray-900 truncate mb-3">New cluster</h2>

  <div class="rounded-lg bg-gray-100 ring-1 ring-gray-900 ring-opacity-5">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="md:grid md:grid-cols-3 md:gap-6">
        <div class="md:col-span-1">
          <div class="px-4 sm:px-0">
            <h3 class="text-lg font-medium leading-6 text-gray-900">New cluster</h3>
            <p class="mt-1 text-sm text-gray-600">
              This information will be displayed publicly so be careful what you share.
            </p>
            <pre class="text-xs">
New cluster ->
  7. Schema registry url?
  7.1 Schema registry is secured with auth?
      YES -> 7.1.1 Schema registry username
      YES -> 7.1.2 Schema registry password
  8. Kafka connect? (url)
  8.1 Kafka connect is secured with auth?
      YES -> 8.1.1 Schema registry username
      YES -> 8.1.2 Schema registry password

  9. JMX metrics?
  9.1 JMX url
  9.2 JMX SSL?
  9.3 JMX is secured with auth?
      YES -> 9.3.1 Schema registry username
      YES -> 9.3.2 Schema registry password
            </pre>
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
</style>

# Quick Start

1. Ensure you have docker installed
2. Ensure your kafka cluster is available from the machine you're planning to run the app on
3. Run the following:

```
docker run -it -p 8080:8080 -e DYNAMIC_CONFIG_ENABLED=true provectuslabs/kafka-ui
```

4. Go to \`[http://localhost:8080/ui/clusters/create-new-cluster](http://localhost:8080/ui/clusters/create-new-cluster)\` and configure your first cluster by pressing on "Configure new cluster" button.

When you're done with testing, you can refer to the next articles to persist your config & deploy the app wherever you need to.

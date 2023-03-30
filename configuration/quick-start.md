# Quick Start

## Quick start (demo run)

1. Ensure you have docker installed
2. Ensure your kafka cluster is available from the machine you're planning to run the app on
3. Run the following:

```
docker run -it -p 8080:8080 -e DYNAMIC_CONFIG_ENABLED=true provectuslabs/kafka-ui
```

4. Go to \`[http://localhost:8080/ui/clusters/create-new-cluster](http://localhost:8080/ui/clusters/create-new-cluster)\` and configure your first cluster by pressing on "Configure new cluster" button.

When you're done with testing, you can refer to the next articles to persist your config & deploy the app wherever you need to.

## Persistent start

Please ensure the target volume (`~/kui/config.yml`) of your config file does exist.

```
services:
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - 8080:8080
    environment:
      DYNAMIC_CONFIG_ENABLED: true
    volumes:
      - ~/kui/config.yml:/etc/kafkaui/dynamic_config.yaml
```

## AWS Marketplace

To start the app quickly on AWS, please refer to **this page.**

The app in AWS Marketplace could be found by [this link](https://aws.amazon.com/marketplace/pp/prodview-ogtt5hfhzkq6a).

## Helm way

To install the app via Helm please refer to [this page](helm-charts/quick-start.md).

# OpenDataDiscovery Integration

Kafka-ui has integration with the [OpenDataDiscovery platform](https://opendatadiscovery.org/) (ODD).

ODD Platform allows you to monitor and navigate kafka data streams and see how they embed into your data platform.

This integration allows you to use kafka-ui as an ODD "Collector" for kafka clusters.

Currently, kafka-ui exports:

* kafka topics as ODD Datasets with topic's metadata, configs, and schemas
* kafka-connect's connectors as ODD Transformers, including input & output topics and additional connector configs

Configuration properties:

| Env variable name             | Yaml property               | Description                                                                                     |
| ----------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| INTEGATION\_ODD\_URL          | integration.odd.ulr         | ODD platform instance URL. Required.                                                            |
| INTEGRATION\_ODD\_TOKEN       | integration.odd.token       | Collector's token generated in ODD. Required.                                                   |
| INTEGRATION\_ODD\_TOPICSREGEX | integration.odd.topicsRegex | RegEx for topic names that should be exported to ODD. Optional, all topics exported by default. |

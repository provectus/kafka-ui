# OpenDataDiscovery integration

Since version 0.6 kafka-ui has an integration with [OpenDataDiscovery platform](https://opendatadiscovery.org/) (ODD).

ODD Platform allows you to monitor and navigate kafka data streams and see how they embed into your data platform.

This integration allows you to use kafka-ui as an ODD "Collector" for kafka clusters.

Currently, kafka-ui exports:

- kafka topics as ODD Datasets with topic's metadata, configs and schemas
- kafka-connect's connectors as ODD Transformers, including input & output topics and additional connector's configs

Configuration properties:

| Env variable name               	 | Yaml property               | Description                                                                                     |
|-----------------------------------|-----------------------------|-------------------------------------------------------------------------------------------------|
| INTEGATION_ODD_URL                | integration.odd.ulr         | ODD platform instance URL. Required.                                                            |
| INTEGRATION_ODD_TOKEN             | integration.odd.token       | Collector's token generated in ODD. Required.                                                   |
| INTEGRATION_ODD_TOPICSREGEX       | integration.odd.topicsRegex | RegEx for topic names that should be exported to ODD. Optional, all topics exported by default. |



# Common problems

## Login module control flag not specified in JAAS config

If you are running against confluent cloud and you have specified correctly the jass config and still continue getting these errors look to to see if you are passing confluent.license in the connector, absence of a license returns a number of bogus errors like "Login module control flag not specified in JAAS config".

https://docs.confluent.io/platform/current/connect/license.html

Good resource for what properties are needed here: https://gist.github.com/rmoff/49526672990f1b4f7935b62609f6f567

## Cluster authorization failed

Check the [required permissions](../configuration/configuration/required-acls.md).

## Confluent cloud errors

Set this property to `true`: `KAFKA_CLUSTERS_<id>_DISABLELOGDIRSCOLLECTION`

## AWS MSK w/ IAM: Access denied

https://github.com/provectus/kafka-ui/discussions/1104#discussioncomment-1656843 https://github.com/provectus/kafka-ui/discussions/1104#discussioncomment-2963449 https://github.com/provectus/kafka-ui/issues/2184#issuecomment-1198506124

## DataBufferLimitException: Exceeded limit on max bytes to buffer

Increase `webclient.max-in-memory-buffer-size` property value. Default value is `20MB`.

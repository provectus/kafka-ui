# Common problems

## `Login module control flag not specified in JAAS config`

If you are running against confluent cloud and you have specified correctly the jass config and still continue getting these errors look to see if you are passing confluent. the license in the connector, the absence of a license returns a number of bogus errors like "Login module control flag not specified in JAAS config".

https://docs.confluent.io/platform/current/connect/license.html

A good resource for what properties are needed is here: https://gist.github.com/rmoff/49526672990f1b4f7935b62609f6f567

## Cluster authorization failed

Check the [required permissions](../configuration/configuration/required-acls.md).

## AWS MSK w/ IAM: Access denied

https://github.com/provectus/kafka-ui/discussions/1104#discussioncomment-1656843 https://github.com/provectus/kafka-ui/discussions/1104#discussioncomment-2963449 https://github.com/provectus/kafka-ui/issues/2184#issuecomment-1198506124

## AWS MSK: TimeoutException

Thanks to ahlooli#2666 on discord:

1. Create a secret in AWS secret manager store that contains key:value pair with 1 username and 1 password, there are certain rules to be followed like the name of the secret (eg. need to start with MSK\_ \*\*), so need to refer back to AWS documentation.
2. Proceed to MSK console and create the MSK cluster, my cluster was the "provisioned" type. Then choose SASL/SCRAM. Another option also needs to follow documentation for your preferred configuration.
3. After the Cluster has been created, you can then proceed to associate the Secrets created earlier to MSK cluster. (Done in MSK Console)
4. Then we can proceed to create a custom security group that allows port 9096 (or whichever MSK broker is using). Rough idea:
   1. Source: ESK cluster security group
   2. Type: TCP
   3. Port: 9096
5. Find out all the MSK's broker ENI. Proceed to attach the above sec. group to each ENI. (if you have 3 brokers which means you have 3 Eni, you need to do it manually 1 by 1)

At this stage, the AWS side should have sufficient permission to allow KAFKA-UI to communicate with it.

## DataBufferLimitException: Exceeded limit on max bytes to buffer

Increase `webclient.max-in-memory-buffer-size` property value. Default value is `20MB`.

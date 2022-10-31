# Ceate serverless MSK service on AWS and attach policies

## Create  serverless MSK.

1. Go to MSK page.
2. Click "create cluster".
3. Choose "Custom create".
4. Choose "Serverless".
5. Choose VPC and subnets.
6. Choose default security group or use existing one.

## Create Policy

1. Go to iam policies
2. Click create policy
3. Click "JSON"
4. Paste following in editor.  Replace "MSK ARN" with  ARN of your MSK cluster.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeTopicDynamicConfiguration",
                "kafka-cluster:AlterTopicDynamicConfiguration",
                "kafka-cluster:AlterTopic",
                "kafka-cluster:DescribeClusterDynamicConfiguration",
                "kafka-cluster:Connect",
                "kafka-cluster:DeleteTopic"
            ],
            "Resource": [
                "MSK_ARN",
                "MSK_ARN/*"
            ]
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:CreateTopic",
                "kafka-cluster:ReadData",
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:WriteData"
            ],
            "Resource": "MSK_ARN/*"
        },
        {
            "Sid": "VisualEditor2",
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": "MSK_ARN/*"
        }
    ]
}
```

### Attach policy to user to provide access.

##
Run the app with `KAFKA_CLUSTERS_0_DISABLELOGDIRSCOLLECTION`

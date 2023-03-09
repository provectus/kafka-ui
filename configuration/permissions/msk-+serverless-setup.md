# MSK (+Serverless) Setup

This guide has been written for MSK Serverless but is applicable for MSK in general as well.

### Authentication options for Kafka-UI:

```
KAFKA_CLUSTERS_0_PROPERTIES_SECURITY_PROTOCOL=SASL_SSL
KAFKA_CLUSTERS_0_PROPERTIES_SASL_MECHANISM=AWS_MSK_IAM
KAFKA_CLUSTERS_0_PROPERTIES_SASL_JAAS_CONFIG='software.amazon.msk.auth.iam.IAMLoginModule required;'
KAFKA_CLUSTERS_0_PROPERTIES_SASL_CLIENT_CALLBACK_HANDLER_CLASS='software.amazon.msk.auth.iam.IAMClientCallbackHandler'
```

### Creating an instance

1. Go to the MSK page
2. Click "create cluster"
3. Choose "Custom create"
4. Choose "Serverless"
5. Choose VPC and subnets
6. Choose the default security group or use the existing one

### Creating a policy

1. Go to IAM policies
2. Click "create policy"
3. Click "JSON"
4. Paste the following policy example in the editor, and replace "MSK ARN" with the ARN of your MSK cluster

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DescribeCluster",
                "kafka-cluster:AlterCluster",
                "kafka-cluster:Connect"
            ],
            "Resource": "arn:aws:kafka:eu-central-1:297478128798:cluster/test-wizard/7b39802a-21ac-48fe-b6e8-a7baf2ae2533-s2"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:DeleteGroup",
                "kafka-cluster:DescribeCluster",
                "kafka-cluster:ReadData",
                "kafka-cluster:DescribeTopicDynamicConfiguration",
                "kafka-cluster:AlterTopicDynamicConfiguration",
                "kafka-cluster:AlterGroup",
                "kafka-cluster:AlterClusterDynamicConfiguration",
                "kafka-cluster:AlterTopic",
                "kafka-cluster:CreateTopic",
                "kafka-cluster:DescribeTopic",
                "kafka-cluster:AlterCluster",
                "kafka-cluster:DescribeGroup",
                "kafka-cluster:DescribeClusterDynamicConfiguration",
                "kafka-cluster:Connect",
                "kafka-cluster:DeleteTopic",
                "kafka-cluster:WriteData"
            ],
            "Resource": "arn:aws:kafka:eu-central-1:297478128798:topic/test-wizard/7b39802a-21ac-48fe-b6e8-a7baf2ae2533-s2/*"
        },
        {
            "Sid": "VisualEditor2",
            "Effect": "Allow",
            "Action": [
                "kafka-cluster:AlterGroup",
                "kafka-cluster:DescribeGroup"
            ],
            "Resource": "arn:aws:kafka:eu-central-1:297478128798:group/test-wizard/7b39802a-21ac-48fe-b6e8-a7baf2ae2533-s2/*"
        }
    ]
}
```

### Attaching the policy to a user

#### Creating a role for EC2

1. Go to IAM
2. Click "Create role"
3. Choose AWS Services and EC2
4. On the next page find the policy which has been created in the previous step

### Attaching the role to the EC2 instance

1. Go to EC2
2. Choose your EC2 with Kafka-UI
3. Go to Actions -> Security -> Modify IAM role
4. Choose the IAM role from previous step
5. Click Update IAM role

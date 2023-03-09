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

### Attach policy to user to provide access.

## Create role for ec2.

###

1. Go to IAM
2. Click create role
3. Choose AWS Services and EC2
4. On next page find policy which has created on previus step.


## Attach role to ec2

###

1. Go to ec2.
2. choose your ec2 with Kafka-ui IAM.
3. Click Actions, Secutiry, Modify IAM role.
4. Choose IAM role from previuse step.
5. Click Update IAM role

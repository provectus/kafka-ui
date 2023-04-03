# How to Deploy Kafka UI from AWS Marketplace

## Step 1: Go to AWS Marketplace
Go to the AWS Marketplace website and sign in to your account.

## Step 2: Find UI for Apache Kafka
Either use the search bar to find "UI for Apache Kafka" or go to
https://aws.amazon.com/marketplace/pp/prodview-ogtt5hfhzkq6a

## Step 3: Subscribe and Configure
 Click "Continue to Subscribe" and accept the terms and conditions. Click "Continue to Configuration".

## Step 4: Choose Software Version and Region
 Choose your desired software version and region. Click "Continue to Launch".

## Step 5: Launch Instance
 Choose "Launch from Website" and select your desired EC2 instance type. You can choose a free tier instance or choose a larger instance depending on your needs. We recommend having at least 512 RAM for an instane.

 Next, select the VPC and subnet where you want the instance to be launched. If you don't have an existing VPC or subnet, you can create one by clicking "Create New VPC" or "Create New Subnet".

 Choose your security group. A security group acts as a virtual firewall that controls traffic to and from your instance. If you don't have an existing security group, you can create a new one based on the seller settings by clicking "Create New Based on Seller Settings".

 Give your security group a name and description. The seller settings will automatically populate the inbound and outbound rules for the security group based on best practices. You can review and modify the rules if necessary.

 Click "Save" to create your new security group.

 Select your key pair or create a new one. A key pair is used to securely connect to your instance via SSH. If you choose to create a new key pair, give it a name and click "Create". Your private key will be downloaded to your computer, so make sure to keep it in a safe place.

 Finally, click "Launch" to deploy your instance. AWS will create the instance and install the Kafka UI software for you.
 
## Step 6: Check EC2 Status
 To check EC2 state please click on "EC2 console".

## Step 7: Access the Kafka UI
 After the instance is launched, you can check its status on the EC2 dashboard. Once it's running, you can access the Kafka UI by copying the public DNS name or IP address provided by AWS and add after IP address or DNS name port 8080.
 Example.
`ec2-xx-xxx-x-xx.us-west-2.compute.amazonaws.com:8080`
 
## Step 8: Configure Kafka UI to Communicate with Brokers
 If your broker deployed in aws then allow incoming from Kafka-ui ec2 by adding ingress rule in security group which is used for broker.
 If your broker not in aws then be sure that your broker can handle requests from Kafka-ui ec2 ip address. 

## That's it! You've successfully deployed the Kafka UI from AWS Marketplace.

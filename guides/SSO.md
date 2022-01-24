# How to configure SSO
SSO require additionaly to configure TLS for application, in that example we will use self-signed certificate, in case of use legal certificates please skip step 1.
## Step 1
At this step we will generate self-signed PKCS12 keypair.
``` bash
mkdir cert
keytool -genkeypair -alias ui-for-apache-kafka -keyalg RSA -keysize 2048 \
  -storetype PKCS12 -keystore cert/ui-for-apache-kafka.p12 -validity 3650
```
## Step 2
Create new application in any SSO provider, we will continue with [Auth0](https://auth0.com).

<img src="https://github.com/provectus/kafka-ui/raw/images/images/sso-new-app.png" width="70%"/>

After that need to provide callback URLs, in our case we will use `https://127.0.0.1:8080/login/oauth2/code/auth0`

<img src="https://github.com/provectus/kafka-ui/raw/images/images/sso-configuration.png" width="70%"/>

This is a main parameters required for enabling SSO

<img src="https://github.com/provectus/kafka-ui/raw/images/images/sso-parameters.png" width="70%"/>

## Step 3
To launch UI for Apache Kafka with enabled TLS and SSO run following:
``` bash
docker run -p 8080:8080 -v `pwd`/cert:/opt/cert -e AUTH_TYPE=LOGIN_FORM \
  -e SECURITY_BASIC_ENABLED=true \
  -e SERVER_SSL_KEY_STORE_TYPE=PKCS12 \
  -e SERVER_SSL_KEY_STORE=/opt/cert/ui-for-apache-kafka.p12 \
  -e SERVER_SSL_KEY_STORE_PASSWORD=123456 \
  -e SERVER_SSL_KEY_ALIAS=ui-for-apache-kafka \
  -e SERVER_SSL_ENABLED=true \
  -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTID=uhvaPKIHU4ZF8Ne4B6PGvF0hWW6OcUSB \
  -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTSECRET=YXfRjmodifiedTujnkVr7zuW9ECCAK4TcnCio-i \
  -e SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_AUTH0_ISSUER_URI=https://dev-a63ggcut.auth0.com/ \
  -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_SCOPE=openid \
  -e TRUST_STORE=/opt/cert/ui-for-apache-kafka.p12 \
  -e TRUST_STORE_PASSWORD=123456 \
provectuslabs/kafka-ui:latest
```
In the case with trusted CA-signed SSL certificate and SSL termination somewhere outside of application we can pass only SSO related environment variables:
``` bash
docker run -p 8080:8080 -v `pwd`/cert:/opt/cert -e AUTH_TYPE=OAUTH2 \
  -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTID=uhvaPKIHU4ZF8Ne4B6PGvF0hWW6OcUSB \
  -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTSECRET=YXfRjmodifiedTujnkVr7zuW9ECCAK4TcnCio-i \
  -e SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_AUTH0_ISSUER_URI=https://dev-a63ggcut.auth0.com/ \
  -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_SCOPE=openid \
provectuslabs/kafka-ui:latest
```

## Step 4 (Load Balancer HTTP) (optional)
If you're using load balancer/proxy and use HTTP between the proxy and the app, you might want to set `server_forward-headers-strategy` to `native` as well (`SERVER_FORWARDHEADERSSTRATEGY=native`), for more info refer to [this issue](https://github.com/provectus/kafka-ui/issues/1017).

## Step 5 (Azure) (optional)
For Azure AD (Office365) OAUTH2 you'll want to add additional environment variables:

```bash
docker run -p 8080:8080 \
        -e KAFKA_CLUSTERS_0_NAME="${cluster_name}"\
        -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS="${kafka_listeners}" \
        -e KAFKA_CLUSTERS_0_ZOOKEEPER="${zookeeper_servers}" \
        -e KAFKA_CLUSTERS_0_KAFKACONNECT_0_ADDRESS="${kafka_connect_servers}"
        -e AUTH_TYPE=OAUTH2 \
        -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTID=uhvaPKIHU4ZF8Ne4B6PGvF0hWW6OcUSB \
        -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTSECRET=YXfRjmodifiedTujnkVr7zuW9ECCAK4TcnCio-i \
        -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_SCOPE="https://graph.microsoft.com/User.Read" \
        -e SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_AUTH0_ISSUER_URI="https://login.microsoftonline.com/{tenant-id}/v2.0" \
        -d provectuslabs/kafka-ui:latest"
```

Note that scope is created by default when Application registration is done in Azure portal.
You'll need to update application registration manifest to include `"accessTokenAcceptedVersion": 2`

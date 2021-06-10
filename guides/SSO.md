# How to configure SSO
SSO require additionaly to configure TLS for application, in that example we will use self-signed cert, in case of use legal certificates please skip step 1.
#### Step 1
At this step we will generate self-signed PKCS12 keypair.
``` bash
mkdir cert
keytool -genkeypair -alias ui-for-apache-kafka -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore cert/ui-for-apache-kafka.p12 -validity 3650
```
#### Step 2
Create new application in any SSO provider, we will continue with [Auth0](https://auth0.com).
![Create new application](https://github.com/provectus/kafka-ui/raw/images/images/sso-new-app.png)
After that need to provide callback URLs, in our case we will use `https://127.0.0.1:8080/login/oauth2/code/auth0`
![Configuration](https://github.com/provectus/kafka-ui/raw/images/images/sso-configuration.png)
This is a main parameters required for enabling SSO
![Parameters](https://github.com/provectus/kafka-ui/raw/images/images/sso-parameters.png)
#### Step 3
To launch UI for Apache Kafka with enabled TLS and SSO run following:
``` bash
docker run -p 8080:8080 -v `pwd`/cert:/opt/cert -e AUTH_ENABLED=true -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTID=uhvaPKIHU4ZF8Ne4B6PGvF0hWW6OcUSB -e SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AUTH0_CLIENTSECRET=YXfRXbitY1F5GajmodifiedTujnkVr7zuW9ECCAK4TcnCio-i -e SECURITY_BASIC_ENABLED=true -e SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_AUTH0_ISSUER_URI=https://dev-a63ggcut.auth0.com/ -e SERVER_SSL_KEY_STORE_TYPE=PKCS12 -e SERVER_SSL_KEY_STORE=/opt/cert/ui-for-apache-kafka.p12 -e SERVER_SSL_KEY_STORE_PASSWORD=123456 -e SERVER_SSL_KEY_ALIAS=ui-for-apache-kafka -e SERVER_SSL_ENABLED=true -e TRUST_STORE=/opt/cert/ui-for-apache-kafka.p12 -e TRUST_STORE_PASSWORD=123456 provectuslabs/kafka-ui:0.1.0
```
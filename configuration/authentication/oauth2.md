# OAuth2

## Examples to set up different oauth providers

### Cognito

```
kafka:
  clusters:
    - name: local
      bootstrapServers: localhost:9092
    # ...

auth:
  type: OAUTH2
  oauth2:
    client:
      cognito:
        clientId: xxx
        clientSecret: yyy
        scope: openid
        client-name: cognito
        provider: cognito
        redirect-uri: http://localhost:8080/login/oauth2/code/cognito
        authorization-grant-type: authorization_code
        issuer-uri: https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxx
        jwk-set-uri: https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_xxx/.well-known/jwks.json
        user-name-attribute: username
        custom-params:
          type: cognito
          logoutUrl: https://<XXX>>.eu-central-1.amazoncognito.com/logout
```

### Google

```
kafka:
  clusters:
    - name: local
      bootstrapServers: localhost:9092
    # ...

auth:
  type: OAUTH2
  oauth2:
    client:
      google:
        provider: google
        clientId: xxx.apps.googleusercontent.com
        clientSecret: GOCSPX-xxx
        user-name-attribute: email
        custom-params:
          type: google
          allowedDomain: provectus.com

```

### Github:

```
kafka:
  clusters:
    - name: local
      bootstrapServers: localhost:9092
    # ...

auth:
  type: OAUTH2
  oauth2:
    client:
      github:
        provider: github
        clientId: xxx
        clientSecret: yyy
        scope:
          - read:org
        user-name-attribute: login
        custom-params:
          type: github
```

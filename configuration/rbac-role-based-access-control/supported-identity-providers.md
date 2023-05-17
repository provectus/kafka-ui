---
description: The list of supported auth mechanisms for RBAC
---

# Supported Identity Providers

### Generic OAuth

Any OAuth provider which is not of the list: Google, GitHub, Cognito.

Set up the auth itself first, docs [here](../authentication/oauth2.md) and [here](../authentication/sso-guide.md)

```yaml
      subjects:
        - provider: oauth
          type: role
          value: "role-name"
```

#### Okta

You can map Okta Groups to roles.  First confirm that your okta administrator has included the `group` claim or the groups will not be passed in the auth token.

Ensure `roles-field` in the auth config to `groups` and that `groups` is include in the `scope`, see [here](../authentication/oauth2.md###Okta) for more details.

Configure the role mapping to the okta group:

```yaml
      subjects:
        - provider: oauth
          type: role
          value: "<okta-group-name>"
```

### Google

Set up google auth [first](../authentication/oauth2.md#google)

```yaml
        - provider: oauth_google
          type: domain
          value: "memelord.lol"
        - provider: oauth_google
          type: user
          value: "kek@memelord.lol"
```

### Github

Set up github auth [first](../authentication/oauth2.md#github)

```yaml
        - provider: oauth_github
          type: organization
          value: "provectus"
        - provider: oauth_github
          type: user
          value: "memelord"
```

### Cognito

Set up cognito auth [first](../authentication/oauth2.md#cognito)

```yaml
        - provider: oauth_cognito
          type: user
          value: "zoidberg"
        - provider: oauth_cognito
          type: group
          value: "memelords"
```

### LDAP

Set up LDAP auth [first](../authentication/ldap-active-directory.md)

```yaml
        - provider: ldap
          type: group
          value: "admin_staff"
```

### Active Directory

Not yet supported, see [Issue 3741](https://github.com/provectus/kafka-ui/issues/3741)

```yaml
       - provider: ldap_ad # NOT YET SUPPORTED, SEE ISSUE 3741
          type: group
          value: "admin_staff"
```

# FAQ

### Basic (username password) authentication

[basic-authentication.md](../configuration/authentication/basic-authentication.md "mention")

### Role-based access control

[rbac-role-based-access-control](../configuration/rbac-role-based-access-control/ "mention")

### OAuth 2

[oauth2.md](../configuration/authentication/oauth2.md "mention")

### LDAP

See [this](https://github.com/provectus/kafka-ui/blob/master/documentation/compose/auth-ldap.yaml#L29) example.

### Active Directory (LDAP)

See [this](https://github.com/provectus/kafka-ui/blob/master/documentation/compose/auth-ldap.yaml#L29) example.

### SAML

Planned, see [#478](https://github.com/provectus/kafka-ui/issues/478)

### Smart filters syntax

**Variables bound to groovy context**: partition, timestampMs, keyAsText, valueAsText, header, key (json if possible), value (json if possible).

**JSON parsing logic**:

Key and Value (if they can be parsed to JSON) they are bound as JSON objects, otherwise bound as nulls.

**Sample filters**:

1. `keyAsText != null && keyAsText ~"([Gg])roovy"` - regex for key as a string
2. `value.name == "iS.ListItemax" && value.age > 30` - in case value is json
3. `value == null && valueAsText != null` - search for values that are not nulls and are not json
4. `headers.sentBy == "some system" && headers["sentAt"] == "2020-01-01"`
5. multiline filters are also allowed:

```
def name = value.name
def age = value.age
name == "iliax" && age == 30
```

### Can I use the app as API?

Yes, you can. Swagger declaration is located [here](https://github.com/provectus/kafka-ui/blob/master/kafka-ui-contract/src/main/resources/swagger/kafka-ui-api.yaml).

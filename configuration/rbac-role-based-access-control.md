# RBAC (Role based access control)

## Role based access control

In this article we'll guide how to setup Kafka-UI with role-based access control.

### Authentication methods

First of all, you'd need to setup authentication method(s). Refer to [this](https://github.com/provectus/kafka-ui/wiki/OAuth-Configuration) article for OAuth2 setup.\
LDAP: TBD

### Config placement

First of all you have to decide if either:

1. You wish to store all roles in a separate config file
2. Or within a main config file

This is how you include one more file to start with: docker-compose example:

```
services:
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      # other properties, omitted
      spring.config.additional-location: /roles.yml
    volumes:
      - /tmp/roles.yml:/roles.yml
```

Alternatively, you can append the roles file contents to your main config file.

### Roles file structure

#### Clusters

In the roles file we define roles, duh. Every each role has an access to defined clusters:

```
rbac:
  roles:
    - name: "memelords"
      clusters:
        - local
        - dev
        - staging
        - prod
```

#### Subjects

A role also has a list of _subjects_ which are the entities we will use to assign roles to. They are provider-dependant, in general they can be users, groups or some other entities (github orgs, google domains, LDAP queries, etc.) In this example we define a role `memelords` which will contain all the users within google domain `memelord.lol` and, additionally, a github user `Haarolean`. You can combine as many subjects as you want within a role.

```
    - name: "memelords"
      subjects:
        - provider: oauth_google
          type: domain
          value: "memelord.lol"
        - provider: oauth_github
          type: user
          value: "Haarolean"
```

#### Providers

A list of supported providers and corresponding subject fetch mechanism:

* oauth\_google: `user`, `domain`
* oauth\_github: `user`, `organization`
* oauth\_cognito: `user`, `group`
* ldap: (unsupported yet, will do in 0.6 release)
* ldap\_ad: (unsupported yet, will do in 0.6 release)

Find the more detailed examples in a full example file lower.

#### Permissions

Next thing which is present in your roles file is, surprisingly, permissions. They consist of:

1. Resource Can be one of: `CLUSTERCONFIG`, `TOPIC`, `CONSUMER`, `SCHEMA`, `CONNECT`, `KSQL`.
2. Resource value Either a fixed string or a regular expression identifying resource. Value is not applicable for `clusterconfig` and `ksql` resources. Please do not fill it.
3. Actions It's a list of actions (the possible values depend on the resource, see the lists below) which will be applied to the certain permission. Also note, there's a special action for any of the resources called "all", it will virtually grant all the actions within the corresponding resource. An example for enabling viewing and creating topics which name start with "derp":

```
      permissions:
        - resource: topic
          value: "derp.*"
          actions: [ VIEW, CREATE ]
```

**Actions**

A list of all the actions for the corresponding resources (please note neither resource nor action names are case-sensitive):

* `clusterconfig`: `view`, `edit`
* `topic`: `view`, `create`, `edit`, `delete`, `messages_read`, `messages_produce`, `messages_delete`
* `consumer`: `view`, `delete`, `reset_offsets`
* `schema`: `view`, `create`, `delete`, `edit`, `modify_global_compatibility`
* `connect`: `view`, `edit`, `create`
* `ksql`: `execute`

## Example file

**A complete file example:**

```
rbac:
  roles:
    - name: "memelords"
      clusters:
        - local
        - dev
        - staging
        - prod
      subjects:
        - provider: oauth_google
          type: domain
          value: "memelord.lol"
        - provider: oauth_google
          type: user
          value: "kek@memelord.lol"

        - provider: oauth_github
          type: organization
          value: "memelords_team"
        - provider: oauth_github
          type: user
          value: "memelord"

        - provider: oauth_cognito
          type: user
          value: "username"
        - provider: oauth_cognito
          type: group
          value: "memelords"

        # LDAP NOT IMPLEMENTED YET
        - provider: ldap
          type: group
          value: "ou=devs,dc=planetexpress,dc=com"
        - provider: ldap_ad
          type: user
          value: "cn=germanosin,dc=planetexpress,dc=com"

      permissions:
        - resource: clusterconfig
          # value not applicable for clusterconfig
          actions: [ "view", "edit" ] # can be with or without quotes

        - resource: topic
          value: "ololo.*"
          actions: # can be a multiline list
            - VIEW # can be upper or lower case
            - CREATE
            - EDIT
            - DELETE
            - MESSAGES_READ
            - MESSAGES_PRODUCE
            - MESSAGES_DELETE

        - resource: consumer
          value: "\_confluent-ksql.*"
          actions: [ VIEW, DELETE, RESET_OFFSETS ]

        - resource: schema
          value: "blah.*"
          actions: [ VIEW, CREATE, DELETE, EDIT, MODIFY_GLOBAL_COMPATIBILITY ]

        - resource: connect
          value: "local"
          actions: [ view, edit, create ]
        # connectors selector not implemented yet, use connects
        #      selector:
        #        connector:
        #          name: ".*"
        #          class: 'com.provectus.connectorName'

        - resource: ksql
          # value not applicable for ksql
          actions: [ execute ]

```

**A read-only setup:**

```
rbac:
  roles:
    - name: "readonly"
      clusters:
        # FILL THIS
      subjects:
        # FILL THIS
      permissions:
        - resource: clusterconfig
          actions: [ "view" ]

        - resource: topic
          value: ".*"
          actions: 
            - VIEW
            - MESSAGES_READ

        - resource: consumer
          value: ".*"
          actions: [ view ]

        - resource: schema
          value: ".*"
          actions: [ view ]

        - resource: connect
          value: ".*"
          actions: [ view ]

```

**An admin-group setup example:**

```
rbac:
  roles:
    - name: "admins"
      clusters:
        # FILL THIS
      subjects:
        # FILL THIS
      permissions:
        - resource: clusterconfig
          actions: all

        - resource: topic
          value: ".*"
          actions: all

        - resource: consumer
          value: ".*"
          actions: all

        - resource: schema
          value: ".*"
          actions: all

        - resource: connect
          value: ".*"
          actions: all

        - resource: ksql
          actions: all

```

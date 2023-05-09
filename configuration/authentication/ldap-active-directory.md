# LDAP / Active Directory

```
auth:
  type: LDAP
spring:
  ldap:
    urls: ldap://localhost:10389
    base: "cn={0},ou=people,dc=planetexpress,dc=com"
    admin-user: "cn=admin,dc=planetexpress,dc=com"
    admin-password: "GoodNewsEveryone"
    user-filter-search-base: "dc=planetexpress,dc=com"
    user-filter-search-filter: "(&(uid={0})(objectClass=inetOrgPerson))"
    group-filter-search-base: "ou=people,dc=planetexpress,dc=com" # required for RBAC
oauth2:
  ldap:
    activeDirectory: false
    aсtiveDirectory:
      domain: memelord.lol
```

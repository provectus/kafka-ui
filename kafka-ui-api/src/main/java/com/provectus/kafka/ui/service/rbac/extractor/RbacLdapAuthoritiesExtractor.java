package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.config.auth.LdapProperties;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.ldap.core.support.BaseLdapPathContextSource;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.ldap.userdetails.DefaultLdapAuthoritiesPopulator;
import org.springframework.util.Assert;

@Slf4j
public class RbacLdapAuthoritiesExtractor extends DefaultLdapAuthoritiesPopulator {

  private final AccessControlService acs;
  private final LdapProperties props;

  public RbacLdapAuthoritiesExtractor(ApplicationContext context,
                                      BaseLdapPathContextSource contextSource, String groupFilterSearchBase) {
    super(contextSource, groupFilterSearchBase);
    this.acs = context.getBean(AccessControlService.class);
    this.props = context.getBean(LdapProperties.class);
  }

  @Override
  protected Set<GrantedAuthority> getAdditionalRoles(DirContextOperations user, String username) {
    var ldapGroups = getRoles(user.getNameInNamespace(), username);

    return acs.getRoles()
        .stream()
        .filter(r -> r.getSubjects()
            .stream()
            .filter(subject -> subject.getProvider().equals(Provider.LDAP))
            .filter(subject -> subject.getType().equals("group"))
            .anyMatch(subject -> ldapGroups.contains(subject.getValue()))
        )
        .map(Role::getName)
        .peek(role -> log.trace("Mapped role [{}] for user [{}]", role, username))
        .map(SimpleGrantedAuthority::new)
        .collect(Collectors.toSet());
  }

  private Set<String> getRoles(String userDn, String username) {
    var groupSearchBase = props.getGroupFilterSearchBase();
    Assert.notNull(groupSearchBase, "groupSearchBase is empty");

    var groupRoleAttribute = props.getGroupRoleAttribute();
    if (groupRoleAttribute == null) {

      groupRoleAttribute = "cn";
    }

    log.trace(
        "Searching for roles for user [{}] with DN [{}], groupRoleAttribute [{}] and filter [{}] in search base [{}]",
        username, userDn, groupRoleAttribute, getGroupSearchFilter(), groupSearchBase);

    var ldapTemplate = getLdapTemplate();
    ldapTemplate.setIgnoreNameNotFoundException(true);

    Set<Map<String, List<String>>> userRoles = ldapTemplate.searchForMultipleAttributeValues(
        groupSearchBase, getGroupSearchFilter(), new String[] {userDn, username},
        new String[] {groupRoleAttribute});

    return userRoles.stream()
        .map(record -> record.get(getGroupRoleAttribute()).get(0))
        .peek(group -> log.trace("Found LDAP group [{}] for user [{}]", group, username))
        .collect(Collectors.toSet());
  }

}

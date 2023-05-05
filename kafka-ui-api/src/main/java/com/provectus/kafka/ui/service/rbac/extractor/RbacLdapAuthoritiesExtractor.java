package com.provectus.kafka.ui.service.rbac.extractor;

import com.provectus.kafka.ui.config.auth.LdapProperties;
import com.provectus.kafka.ui.model.rbac.Role;
import com.provectus.kafka.ui.model.rbac.provider.Provider;
import com.provectus.kafka.ui.service.rbac.AccessControlService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
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

  private final Function<Map<String, List<String>>, GrantedAuthority> authorityMapper = (record) -> {
    String role = record.get(getGroupRoleAttribute()).get(0);
    return new SimpleGrantedAuthority(role);
  };

  public RbacLdapAuthoritiesExtractor(ApplicationContext context) {
    super(context.getBean(BaseLdapPathContextSource.class), null);
    this.acs = context.getBean(AccessControlService.class);
    this.props = context.getBean(LdapProperties.class);
  }

  @Override
  public Set<GrantedAuthority> getAdditionalRoles(DirContextOperations user, String username) {
    return acs.getRoles()
        .stream()
        .map(Role::getSubjects)
        .flatMap(List::stream)
        .filter(s -> s.getProvider().equals(Provider.LDAP))
        .filter(s -> s.getType().equals("group"))
        .flatMap(subject -> getRoles(subject.getValue(), user.getNameInNamespace(), username).stream())
        .collect(Collectors.toSet());
  }

  private Set<GrantedAuthority> getRoles(String groupSearchBase, String userDn, String username) {
    Assert.notNull(groupSearchBase, "groupSearchBase is empty");

    log.trace(
        "Searching for roles for user [{}] with DN [{}], groupRoleAttribute [{}] and filter [{}] in search base [{}]",
        username, userDn, props.getGroupRoleAttribute(), getGroupSearchFilter(), groupSearchBase);

    var ldapTemplate = getLdapTemplate();
    ldapTemplate.setIgnoreNameNotFoundException(true);

    Set<Map<String, List<String>>> userRoles = ldapTemplate.searchForMultipleAttributeValues(
        groupSearchBase, getGroupSearchFilter(), new String[] {userDn, username},
        new String[] {props.getGroupRoleAttribute()});

    return userRoles.stream()
        .map(authorityMapper)
        .peek(a -> log.debug("Mapped role [{}] for user [{}]", a, username))
        .collect(Collectors.toSet());
  }

}

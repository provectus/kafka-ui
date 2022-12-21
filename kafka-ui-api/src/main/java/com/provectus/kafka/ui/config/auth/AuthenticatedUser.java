package com.provectus.kafka.ui.config.auth;

import java.util.Collection;
import lombok.Value;

public record AuthenticatedUser(String principal, Collection<String> groups) {

}

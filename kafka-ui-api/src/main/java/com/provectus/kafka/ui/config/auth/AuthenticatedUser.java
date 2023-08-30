package com.provectus.kafka.ui.config.auth;

import java.util.Collection;

public record AuthenticatedUser(String principal, Collection<String> groups) {

}

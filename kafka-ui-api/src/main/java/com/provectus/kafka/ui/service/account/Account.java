package com.provectus.kafka.ui.service.account;

import java.util.List;

public record Account(Long id, String username, boolean enabled, List<String> roles) {

}

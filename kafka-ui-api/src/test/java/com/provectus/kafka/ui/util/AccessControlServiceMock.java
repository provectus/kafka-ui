package com.provectus.kafka.ui.util;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import org.mockito.Mockito;
import reactor.core.publisher.Mono;

public class AccessControlServiceMock {

  public AccessControlService getMock() {
    AccessControlService mock = Mockito.mock(AccessControlService.class);

    when(mock.validateAccess(any())).thenReturn(Mono.empty());
    when(mock.isSchemaAccessible(anyString(), anyString())).thenReturn(Mono.just(true));

    when(mock.filterViewableTopics(any(), any())).then(invocation -> Mono.just(invocation.getArgument(0)));

    return mock;
  }
}

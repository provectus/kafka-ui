package com.provectus.kafka.ui.util;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.provectus.kafka.ui.service.rbac.AccessControlService;
import org.mockito.Mockito;
import reactor.core.publisher.Mono;

public class AccessControlServiceMock {

  private static AccessControlService mock = Mockito.mock(AccessControlService.class);

  public static AccessControlService getMock() {
    AccessControlServiceMock.mock = Mockito.mock(AccessControlService.class);

    when(mock.validateAccess(any())).thenReturn(Mono.empty());
    when(mock.isSchemaAccessible(anyString(), anyString())).thenReturn(Mono.just(true));

    when(mock.isTopicAccessible(any(), anyString())).thenReturn(Mono.just(true));

    return mock;
  }
}

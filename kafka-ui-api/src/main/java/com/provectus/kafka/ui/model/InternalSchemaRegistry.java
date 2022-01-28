package com.provectus.kafka.ui.model;

import java.util.LinkedList;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
public class InternalSchemaRegistry {
  private final String username;
  private final String password;
  private final LinkedList<String> url;
  private final FailoverUrlList urlList;

  @Builder(toBuilder = true)
  public InternalSchemaRegistry(String username, String password, List<String> url) {
    this.username = username;
    this.password = password;
    this.url = new LinkedList<>(url);
    this.urlList = new FailoverUrlList(url);
  }

  public String getPrimaryNodeUri() {
    return url.getFirst();
  }

  public String getUri() {
    return urlList.current();
  }

  public void markAsUnavailable(String url) {
    urlList.fail(url);
  }

  public boolean isFailoverAvailable() {
    return this.urlList.isFailoverAvailable();
  }
}

package com.provectus.kafka.ui.exception;

public class ClusterNotFoundException extends NotFoundException {

  public ClusterNotFoundException() {
    super("Cluster not found");
  }

  public ClusterNotFoundException(String message) {
    super(message);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.CLUSTER_NOT_FOUND;
  }
}

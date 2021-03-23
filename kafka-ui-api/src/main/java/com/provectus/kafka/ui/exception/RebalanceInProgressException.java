package com.provectus.kafka.ui.exception;


public class RebalanceInProgressException extends CustomBaseException {

  public RebalanceInProgressException() {
    super("Rebalance is in progress.");
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.REBALANCE_IN_PROGRESS;
  }
}

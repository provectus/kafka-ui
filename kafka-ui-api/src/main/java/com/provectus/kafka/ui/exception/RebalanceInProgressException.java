package com.provectus.kafka.ui.exception;

import org.springframework.http.HttpStatus;

public class RebalanceInProgressException extends CustomBaseException {

    public RebalanceInProgressException() {
        super("Rebalance is in progress.");
    }

    @Override
    public HttpStatus getResponseStatusCode() {
        return HttpStatus.CONFLICT;
    }
}

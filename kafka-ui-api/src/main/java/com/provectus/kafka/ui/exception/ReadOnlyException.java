package com.provectus.kafka.ui.exception;

import org.springframework.http.HttpStatus;

public class ReadOnlyException extends CustomBaseException {

    public ReadOnlyException() {
        super("This cluster is in read-only mode.");
    }

    @Override
    public HttpStatus getResponseStatusCode() {
        return HttpStatus.METHOD_NOT_ALLOWED;
    }
}

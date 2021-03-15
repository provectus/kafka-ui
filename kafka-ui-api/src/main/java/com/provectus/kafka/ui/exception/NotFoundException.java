package com.provectus.kafka.ui.exception;

import org.springframework.http.HttpStatus;

public class NotFoundException extends CustomBaseException {

    public NotFoundException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getResponseStatusCode() {
        return HttpStatus.NOT_FOUND;
    }
}
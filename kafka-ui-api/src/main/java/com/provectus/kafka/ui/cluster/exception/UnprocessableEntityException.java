package com.provectus.kafka.ui.cluster.exception;

import org.springframework.http.HttpStatus;

public class UnprocessableEntityException extends CustomBaseException{

    public UnprocessableEntityException(String message) {
        super(message);
    }

    @Override
    public HttpStatus getResponseStatusCode() {
        return HttpStatus.UNPROCESSABLE_ENTITY;
    }
}

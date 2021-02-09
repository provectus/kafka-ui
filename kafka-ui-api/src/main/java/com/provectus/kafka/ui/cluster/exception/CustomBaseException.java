package com.provectus.kafka.ui.cluster.exception;

import org.springframework.http.HttpStatus;

public abstract class CustomBaseException extends RuntimeException {
    public CustomBaseException() {
    }

    public CustomBaseException(String message) {
        super(message);
    }

    public CustomBaseException(String message, Throwable cause) {
        super(message, cause);
    }

    public CustomBaseException(Throwable cause) {
        super(cause);
    }

    public CustomBaseException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }

    public abstract HttpStatus getResponseStatusCode();
}

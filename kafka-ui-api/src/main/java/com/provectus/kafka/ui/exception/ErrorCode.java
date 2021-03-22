package com.provectus.kafka.ui.exception;

import org.apache.logging.log4j.LogManager;
import org.springframework.http.HttpStatus;

import java.util.HashSet;

import static org.springframework.http.HttpStatus.*;

public enum ErrorCode {

	UNEXPECTED(5000, INTERNAL_SERVER_ERROR),
	BINDING_FAIL(4001, BAD_REQUEST),
	VALIDATION_FAIL(4002, BAD_REQUEST),
	ENTITY_NOT_FOUND(4003, NOT_FOUND),
	READ_ONLY_MODE_ENABLE(4004, METHOD_NOT_ALLOWED),
	REBALANCE_IN_PROGRESS(4005, CONFLICT),
	DUPLICATED_ENTITY(4006, CONFLICT),
	UNPROCESSABLE_ENTITY(4007, HttpStatus.UNPROCESSABLE_ENTITY);

	static {
		// codes uniqueness check
		var codes = new HashSet<Integer>();
		for (ErrorCode value : ErrorCode.values()) {
			if (!codes.add(value.code())) {
				LogManager.getLogger()
						.warn("Multiple {} values refer to code {}", ErrorCode.class, value.code);
			}
		}
	}

	private final int code;
	private final HttpStatus httpStatus;

	ErrorCode(int code, HttpStatus httpStatus) {
		this.code = code;
		this.httpStatus = httpStatus;
	}

	public int code() {
		return code;
	}

	public HttpStatus httpStatus() {
		return httpStatus;
	}
}

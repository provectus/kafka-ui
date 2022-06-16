package com.provectus.kafka.ui.exception;

public class SchemaFailedToDeleteException extends CustomBaseException {

  public SchemaFailedToDeleteException(String schemaName) {
    super(String.format("Unable to delete schema with name %s", schemaName));
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.SCHEMA_NOT_DELETED;
  }
}

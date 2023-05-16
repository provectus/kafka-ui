package com.provectus.kafka.ui.exception;

import java.nio.file.Path;

public class FileUploadException extends CustomBaseException {

  public FileUploadException(String msg, Throwable cause) {
    super(msg, cause);
  }

  public FileUploadException(Path path, Throwable cause) {
    super("Error uploading file %s".formatted(path), cause);
  }

  @Override
  public ErrorCode getErrorCode() {
    return ErrorCode.FILE_UPLOAD_EXCEPTION;
  }
}

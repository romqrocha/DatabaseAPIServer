import { HTTP_STATUS_CODES } from "../constants/httpResponse.js";
import { HTTP_ERRORS } from "../lang/en/errors.js";


export class HttpError extends Error {

  httpStatusCode;

  constructor(httpStatusCode, message) {
    super(message);
    this.httpStatusCode = httpStatusCode;
  }

  static extractErrorCodeAndMessage(error) {
    let errorCode = HTTP_STATUS_CODES.SERVER_ERROR;
    let errorMsg  = HTTP_ERRORS.SERVER_ERROR;

    if (error instanceof HttpError) {
      errorCode = error.httpStatusCode;
      errorMsg  = error.message;
    }
        
    return { code: errorCode, message: (errorCode === HTTP_STATUS_CODES.SERVER_ERROR) ? HTTP_ERRORS.SERVER_ERROR : errorMsg }
  }
}

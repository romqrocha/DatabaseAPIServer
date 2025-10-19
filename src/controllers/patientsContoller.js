// Calls methods in data-access layer

export default class PatientsController {
  constructor() {}
}

/*
Errors can propagate up to methods in this class an be caught and handled here

Ex.

try {

  <method calls in patientsRepository>

  res.writeHead(
    HTTP_STATUS_CODES.OK, 
    { "Content-Type": CONTENT_TYPE.JSON },
    { "Access-Control-Allow-Origin": ALLOWED_ORIGINS } // import ALLOWED_ORIGINS
  );

  res.end(jsonResStr);
}
catch (error) {
  const { code, message } = HttpError.extractErrorCodeAndMessage(error);

  const data = { errorMessage: message }
  const jsonStr = JSON.stringify(data);

  res.writeHead(
    code,
    { "Content-Type": CONTENT_TYPE.JSON },
    { "Access-Control-Allow-Origin": ALLOWED_ORIGINS }
  );
  res.end(jsonStr)
}
*/

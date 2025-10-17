import * as http from 'http';
import { HttpError } from "./errors/httpError.js";
import { HTTP_ERRORS } from "./lang/messages/en/errors.js";
import { CONTENT_TYPE, HTTP_STATUS_CODES } from "./constants/httpResponse.js";
import { ALLOWED_ORIGINS } from "./constants/allowedOrigins.js";

export default class CustomExpress {

  static #GET = "GET";
  static #POST = "POST";
  static #ENDPOINT_ID_DELIMITER = "|";
  static #ROUTES = new Map();

  listen = (port, onServerStart) => {
    const server = http.createServer(async (req, res) => this.processRequest(req, res));
    server.listen(port, onServerStart);
  }

  // === For creating endpoints with http method mappings ===

  // Add the handler to the current list of handlers for that endpoint and http method combination
  get = (endpoint, handler) => {
    const endpointGetId = `${endpoint}${CustomExpress.#ENDPOINT_ID_DELIMITER}${GET}`;
    CustomExpress.#ROUTES.set(endpointGetId, handler);
  }

  post = (endpoint, handler) => {
    const endpointPostId = `${endpoint}${CustomExpress.#ENDPOINT_ID_DELIMITER}${POST}`;
    CustomExpress.#ROUTES.set(endpointPostId, handler);
  }

  processRequest = async (req, res) => {
    try {
      const method = req.method;
      const endpoint = req.url;

      const endpointId = this.matchUrl(endpoint, method);      

      if (!endpointId) {
        throw new HttpError(HTTP_STATUS_CODES.NOT_FOUND, HTTP_ERRORS.RESOURCE_NOT_FOUND_ERROR);
      }

      const handlerFunction = CustomExpress.#ROUTES.get(endpointId);

      await handlerFunction(req, res);
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
  }

  matchUrl = (reqEndpoint, reqMethod) => {
    // remove query parameters and only include the request path part
    const reqPath = reqEndpoint.split('?')[0];

    const endpointIds = CustomExpress.#ROUTES.keys();

    for (const endpointId of endpointIds) {
      // extract registered endpoint path and method
      const [registeredPath, registeredMethod] = endpointId.split(CustomExpress.#ENDPOINT_ID_DELIMITER);
      
      if (reqPath === registeredPath && reqMethod === registeredMethod) {
        return endpointId;
      }
    }
    return null;
  }
}

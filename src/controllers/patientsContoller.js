// Calls methods in data-access layer

import http from 'http';
import url from 'url';
import { ALLOWED_ORIGINS } from "../constants/allowedOrigins.js";
import { CONTENT_TYPE, HTTP_STATUS_CODES } from "../constants/httpResponse.js";
import { HttpError } from "../errors/httpError.js";
import { PatientsRepository } from '../data-access/patient/patientsRepository.js';



export default class PatientsController {
  repository = new PatientsRepository();

  constructor() {}

  handleError = (error) => {
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
  
  /**
   * Handles SELECT queries through get requests
   * @param {http.IncomingMessage} req 
   * @param {http.ServerResponse<http.IncomingMessage>} res 
   */
  select = (req, res) => {
    try {
      const urlParams = url.parse(req.url, true);
      const userQuery = urlParams.query["query"];

      this.repository.executeClientCreatedQuery(userQuery).then((queryResult, fieldPacket) => {
        const [rows] = queryResult;

        const patientRows = rows.map(row => ({
          patientId: row.patientId,
          patientName: row.patientName,
          patientDateOfBirth: row.patientDateOfBirth
        }));

        res.writeHead(
          HTTP_STATUS_CODES.OK, 
          { "Content-Type": CONTENT_TYPE.JSON },
          { "Access-Control-Allow-Origin": ALLOWED_ORIGINS }
        );
        res.end(JSON.stringify(patientRows));
      }).catch((error) => {
        this.handleError(error);
      });
    }
    catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handles INSERT queries through post requests
   * @param {http.IncomingMessage} req 
   * @param {http.ServerResponse<http.IncomingMessage>} res 
   */
  insert = (req, res) => {
    try {
      const data = {};
      const jsonStr = JSON.stringify(data);

      res.writeHead(
        HTTP_STATUS_CODES.OK, 
        { "Content-Type": CONTENT_TYPE.JSON },
        { "Access-Control-Allow-Origin": ALLOWED_ORIGINS }
      );
      res.end(jsonStr);
    }
    catch (error) {
      this.handleError(error);
    }
  }
}

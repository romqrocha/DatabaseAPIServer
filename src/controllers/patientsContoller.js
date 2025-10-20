// Calls methods in data-access layer

import http from 'http';
import url from 'url';
import { ALLOWED_ORIGINS } from "../constants/allowedOrigins.js";
import { CONTENT_TYPE, HTTP_STATUS_CODES } from "../constants/httpResponse.js";
import { HttpError } from "../errors/httpError.js";
import { PatientsRepository } from '../data-access/patient/patientsRepository.js';



export default class PatientsController {

  static #SQL_QUERY_KEY = "sqlQuery";

  #patientsRepository;

  constructor() {
    this.#patientsRepository = new PatientsRepository();
  }

  handleError = (error, res) => {
    const { code, message } = HttpError.extractErrorCodeAndMessage(error);

    const data = { errorMessage: message }
    const jsonStr = JSON.stringify(data);

    res.writeHead(
      code,
      { 
        "Content-Type": CONTENT_TYPE.JSON,
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
      }
    );
    res.end(jsonStr)
  }
  
  /**
   * Handles SELECT queries through get requests
   * @param {http.IncomingMessage} req 
   * @param {http.ServerResponse<http.IncomingMessage>} res 
   */
  select = async (req, res) => {
    try {
      const urlParams = url.parse(req.url, true);
      const sqlQuery = urlParams.query[PatientsController.#SQL_QUERY_KEY];

      const queryResult = await this.#patientsRepository.executeClientCreatedQuery(sqlQuery);

      const [rows] = queryResult;

      const patientRows = rows.map(row => ({
        patientId: row.patientId,
        name: row.name,
        dateOfBirth: row.dateOfBirth
      }));

      res.writeHead(
        HTTP_STATUS_CODES.OK, 
        { 
          "Content-Type": CONTENT_TYPE.JSON,
          "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
        }
      );
      res.end(JSON.stringify(patientRows));
    }
    catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handles INSERT queries through post requests
   * @param {http.IncomingMessage} req 
   * @param {http.ServerResponse<http.IncomingMessage>} res 
   */
  insert = (req, res) => {
    try {
      let body = [];

      req.on("data", (chunk) => {
        if (chunk !== null) {
          body.push(chunk);
        }
      });

      req.on("end", async () => {
        try {
          body = Buffer.concat(body).toString();
          const reqData = JSON.parse(body);

          const sqlQuery = reqData[PatientsController.#SQL_QUERY_KEY];

          const queryResultArr = await this.#patientsRepository.executeClientCreatedQuery(sqlQuery);

          const [queryResult] = queryResultArr;

          const numAffectedRows = queryResult.affectedRows;
          const insertId = queryResult.insertId;

          // const patientRows = rows.map(row => ({
          //   patientId: row.patientId,
          //   patientName: row.patientName,
          //   patientDateOfBirth: row.patientDateOfBirth
          // }));

          const jsonResData = JSON.stringify({ 
            id: insertId, 
            numAffectedRows: numAffectedRows 
          });

          res.writeHead(
            HTTP_STATUS_CODES.CREATED, 
            { 
              "Content-Type": CONTENT_TYPE.JSON,
              "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
            }
          );
          res.end(jsonResData);
        }
        catch (error) {
          this.handleError(error, res);
        }
      });
    }
    catch (error) {
      this.handleError(error, res);
    }
  }
  

  /**
   * @param {http.IncomingMessage} req 
   * @param {http.ServerResponse<http.IncomingMessage>} res 
   */
  bulkCreatePatients = (req, res) => {
    try {
      let body = [];

      req.on("data", (chunk) => {
        if (chunk !== null) {
          body.push(chunk);
        }
      });

      req.on("end", async () => {
        try {
          body = Buffer.concat(body).toString();
          const patients = JSON.parse(body);
          const patientsFromDb = await this.#patientsRepository.createPatients(patients);

          res.writeHead(
            HTTP_STATUS_CODES.CREATED, 
            { 
              "Content-Type": CONTENT_TYPE.JSON,
              "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
            }
          );
          res.end(JSON.stringify(patientsFromDb));
        }
        catch (error) {
          this.handleError(error, res);
        }
      });
    }
    catch (error) {
      this.handleError(error, res);
    }
  }
}

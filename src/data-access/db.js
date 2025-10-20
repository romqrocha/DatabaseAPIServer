import { HttpError } from '../errors/httpError.js';
import { HTTP_STATUS_CODES } from '../constants/httpResponse.js';
import { EMPTY_QUERY_ERROR, REJECTED_SQL_QUERY_ERROR, UNALLOWED_QUERY_COMMAND_ENTERED_ERROR } from '../lang/en/errors.js';
import mysql from 'mysql2/promise'

export default class DB {

  //todo remove the || "" for all except localhost in deployment
  static #DB_HOST = process.env.DB_HOST;
  static #DB_USER = process.env.DB_USER;
  static #DB_PASSWORD = process.env.DB_PASSWORD;
  static #DB = process.env.DB;
  static #DB_PORT = process.env.DB_PORT;

  static #UNALLOWED_CHAR_INPUTS = /;|"|--|\*\*\*.*?\*\*\*/;
  static #UNALLOWED_SQL_COMMANDS = /\b(ALTER|DROP|DELETE|GRANT|REVOKE|TRUNCATE|UPDATE)\b/i;

  static #SQL_SERVER_CONN_REFUSED_CODE = "ECONNREFUSED";

  /**
   * Executes a given query string after applying sanitization and sql command restrictions.
   * @param {string} unsanitizedQueryString 
   */
  static async executeQueryStr(unsanitizedQueryString) {

    DB.#checkIfQueryStringEmpty(unsanitizedQueryString);
    const sanitizedQueryString  = DB.#checkUnsanitizedQueryString(unsanitizedQueryString);
    const validSqlQueryString   = DB.#checkDbQueryRestrictions(sanitizedQueryString);

    let connection;
    try {
      connection = await mysql.createConnection({
        host:       DB.#DB_HOST,
        user:       DB.#DB_USER,
        password :  DB.#DB_PASSWORD,
        database :  DB.#DB,
        port:       DB.#DB_PORT
      });

      const dbResult = await connection.execute(validSqlQueryString);
      return dbResult;
    }
    catch (error) {
      console.log(error);
      if (error.code === DB.#SQL_SERVER_CONN_REFUSED_CODE) {
        throw new HttpError(HTTP_STATUS_CODES.SERVER_ERROR, error.sqlMessage)
      }
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, error.sqlMessage);
    }
    finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Executes a given template query and the values to be used in it, after applying sql command restrictions.
   * @param {string} sqlTemplateStr 
   * @param {string[]} params 
   */
  static async executeQueryTemplate(sqlTemplateStr, params) {

    DB.#checkIfQueryStringEmpty(sqlTemplateStr);
    const validSqlTemplateStr = DB.#checkDbQueryRestrictions(sqlTemplateStr);

    let connection;
    try {
      connection = await mysql.createConnection({
        host:       DB.#DB_HOST,
        user:       DB.#DB_USER,
        password :  DB.#DB_PASSWORD,
        database :  DB.#DB,
        port:       DB.#DB_PORT
      });

      const dbResult = await connection.execute(validSqlTemplateStr, params);
      return dbResult;
    }
    catch (error) {
      console.log(error);
      if (error.code === DB.#SQL_SERVER_CONN_REFUSED_CODE) {
        throw new HttpError(HTTP_STATUS_CODES.SERVER_ERROR, error.sqlMessage)
      }
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, error.sqlMessage);
    }
    finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  static #checkIfQueryStringEmpty(queryString) {
    if (!queryString) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, EMPTY_QUERY_ERROR);
    }
  }

  /**
   * Sanitizes the query string. 
   * (Still has security flaws for sql injection but it's just for a lab)
   * @param {string} unsanitizedQueryString 
   * @returns {string} a (mostly) sanitized query string 
   */
  static #checkUnsanitizedQueryString(unsanitizedQueryString) {
    // reject all queries that contain:
    // - comment characters (--)
    // - ;
    // - '
    // - "
    if (DB.#UNALLOWED_CHAR_INPUTS.test(unsanitizedQueryString)) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, REJECTED_SQL_QUERY_ERROR);
    }

    const sanitizedQueryString = unsanitizedQueryString;

    return sanitizedQueryString;
  }

  /**
   * Checks if a given query string does not have unallowed sql commands.
   * @param {string} queryOrTemplateString 
   * @returns {string} a query string containing valid sql commands.
   */
  static #checkDbQueryRestrictions(queryOrTemplateString) {
    if (DB.#UNALLOWED_SQL_COMMANDS.test(queryOrTemplateString)) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, UNALLOWED_QUERY_COMMAND_ENTERED_ERROR)
    }

    return queryOrTemplateString;
  }
}

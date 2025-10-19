import { HttpError } from '../errors/httpError.js';
import { HTTP_STATUS_CODES } from '../constants/httpResponse.js';
import { EMPTY_QUERY_ERROR, INVALID_SQL_QUERY_ERROR, UNALLOWED_QUERY_COMMAND_ENTERED_ERROR } from '../lang/en/errors.js';
import mysql from 'mysql2/promise'

export default class DB {

  //todo remove the || "" for all except localhost in deployment
  static #DB_HOST = process.env.DB_HOST || 'localhost';
  static #DB_USER = process.env.DB_USER || "lab5";
  static #DB_PASSWORD = process.env.DB_PASSWORD || "lab5verysecretpassword";
  static #DB = process.env.DB || "Lab";
  static #DB_PORT = process.env.BD_PORT || 3307;

  static #INVALID_CHAR_INPUTS = /;|'|"|--|\*\*\*.*?\*\*\*/;
  static #UNALLOWED_SQL_COMMANDS = /\b(ALTER|DROP|DELETE|GRANT|REVOKE|TRUNCATE|UPDATE)\b/i;

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

      return await connection.execute(validSqlQueryString);
    }
    catch (error) {
      console.log("ERROR IN executeQueryStr");
      console.log(error);
      throw error;
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

      console.log(params);
      console.log(validSqlTemplateStr);

      return await connection.execute(validSqlTemplateStr, params);
    }
    catch (error) {
      console.log("ERROR IN executeQueryTemplate");
      console.log(error);
      throw error;
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
    if (DB.#INVALID_CHAR_INPUTS.test(unsanitizedQueryString)) {
      throw new HttpError(HTTP_STATUS_CODES.BAD_REQUEST, INVALID_SQL_QUERY_ERROR);
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

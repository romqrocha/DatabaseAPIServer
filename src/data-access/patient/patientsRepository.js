import DB from '../db.js'
import { CHECK_IF_TABLE_EXISTS, CREATE_PATIENTS_TABLE, INSERT_ENTRY_TEMPLATE_QUERY, QUERY_VALUE_PLACEHOLDER, VARIABLE_LENGTH_VALUES_DEFAULT_PLACEHOLDER, SELECT_PATIENTS_BY_IDS_QUERY } from './queries.js'
import { patientsTableName } from './schema.js';

/**
 * @typedef {Object} Patient
 * @property {string | undefined} patientId
 * @property {string} patientName
 * @property {Date} patientDateOfBirth
*/

/**
 * Repository for Patients db table.
 */
export class PatientsRepository {

  static #TABLE_NOT_EXISTS_NUM = 0;

  constructor() {}

  /**
   * Checks if the Patient table exists. Returns true if it does, otherwise returns false.
   * @returns {Promise<boolean>} boolean value depending on if patient table exists or not.
   */
  async #checkIfTableExists() {
    const [rows]  = await DB.executeQueryTemplate(CHECK_IF_TABLE_EXISTS, [patientsTableName]);
    const tableExists     = (rows[0].count > PatientsRepository.#TABLE_NOT_EXISTS_NUM);
    return tableExists;
  }

  /**
   * Create multiple patient entries in the patients db.
   * @param {Patient[]} patients the list of patients to create in db.
   * @returns {Promise<Patient[]>} the list of patients created in the database
   */
  async createPatients(patients) {
    const queryPlaceholderValues = new Array(patients.length)
    .fill(`(${QUERY_VALUE_PLACEHOLDER}, ${QUERY_VALUE_PLACEHOLDER})`) 
    .join(", "); // should be (?, ?), (?, ?), etc.

    const queryTemplateStr = INSERT_ENTRY_TEMPLATE_QUERY.replace(
      VARIABLE_LENGTH_VALUES_DEFAULT_PLACEHOLDER, 
      queryPlaceholderValues
    );

    const tableExists = await this.#checkIfTableExists();

    if (!tableExists) {
      await DB.executeQueryStr(CREATE_PATIENTS_TABLE);
    }

    const patientsFormatted = patients.flatMap(patient => [patient.patientName, patient.patientDateOfBirth]);

    const [insertResult] = await DB.executeQueryTemplate(queryTemplateStr, patientsFormatted);

    // get the IDs of the inserted patients
    const firstInsertId = insertResult.insertId;
    const patientIds = Array.from({length: patients.length}, (_, i) => firstInsertId + i);
    
    const idPlaceholders = patientIds.map(() => QUERY_VALUE_PLACEHOLDER).join(', ');
    const getPatientsByIdsQuery = SELECT_PATIENTS_BY_IDS_QUERY.replace(VARIABLE_LENGTH_VALUES_DEFAULT_PLACEHOLDER, idPlaceholders);
    
    // retrieve the created patients
    const [rows] = await DB.executeQueryTemplate(getPatientsByIdsQuery, patientIds);

    const patients = rows.map(row => ({
      patientId: row.patientId,
      patientName: row.patientName,
      patientDateOfBirth: row.patientDateOfBirth
    }));
    
    return patients;
  }

  /**
   * Attempts to execute the query sent from client side.
   * @param {string} unsanitizedQueryString the unsanitized sql query string sent from the client.
   */
  async executeClientCreatedQuery(unsanitizedQueryString) {
    const tableExists = await this.#checkIfTableExists();
    if (!tableExists) {
      await DB.executeQueryStr(CREATE_PATIENTS_TABLE);
    }
    
    await DB.executeQueryStr(unsanitizedQueryString);
  }
}

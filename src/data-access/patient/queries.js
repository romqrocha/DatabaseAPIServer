import patientSchema, { patientsTableName } from "./schema.js";

export const QUERY_VALUE_PLACEHOLDER = "?";
export const VARIABLE_LENGTH_VALUES_DEFAULT_PLACEHOLDER = "%";

export const CREATE_PATIENTS_TABLE = 
`
CREATE TABLE IF NOT EXISTS ${patientsTableName} (
  ${patientSchema}
)
`;

export const INSERT_ENTRY_TEMPLATE_QUERY = 
`
INSERT INTO ${patientsTableName} (name, dateOfBirth)
VALUES 
  ${VARIABLE_LENGTH_VALUES_DEFAULT_PLACEHOLDER}
`;

export const CHECK_IF_TABLE_EXISTS = 
`
SELECT COUNT(*) AS count
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME = ${QUERY_VALUE_PLACEHOLDER}
`;

export const patientsTableName = "Patients";

const patientSchema = 
`
  patientId     INT(11) AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100),
  dateOfBirth   DATE
`;

export default patientSchema;

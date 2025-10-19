import CustomExpress from "./customExpress.js";
import PatientsController from "./controllers/patientsContoller.js"
import { PatientsRepository } from "./data-access/patient/patientsRepository.js";
import { HttpError } from "./errors/httpError.js";

const port = process.env.PORT || 8000;
const patientsController = new PatientsController();
const app = new CustomExpress();

app.get("/api/sqlquery", patientsController.select); 
app.post("/api/sqlquery", patientsController.insert); //todo
app.post("/api/patients", patientsController.bulkCreatePatients); //todo

app.listen(port, () => {
  console.log(`Server running on port ${port} - http://localhost:${port}`);
});

// todo - remove after implementing server
// async function testDataAccessLayerAndDb() {
//   const patientsRepository = new PatientsRepository();

  // const patients = [
  //   { patientName: "Sara Brown",  patientDateOfBirth: new Date("1901-01-01") },
  //   { patientName: "John Smith",  patientDateOfBirth: new Date("1901-01-01") },
  //   { patientName: "Jack Ma",     patientDateOfBirth: new Date("1961-01-30") },
  //   { patientName: "Elon Musk",   patientDateOfBirth: new Date("1999-01-01") },
  // ];

//   try {
//     const patientsResponse = await patientsRepository.createPatients(patients);
//     console.log("Patients: ", patientsResponse);
//   }
//   catch (error) {
//     const { code, message } = HttpError.extractErrorCodeAndMessage(error);
//     console.log("Code: ", code);
//     console.log("Message: ", message);
//   }
// }

// testDataAccessLayerAndDb();

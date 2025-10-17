import CustomExpress from "./customExpress";

const patientsController = new PatientsController();
const app = new CustomExpress();

app.get("/api/patients", patientsController.getPatientsByIds);
app.post("api/patients", patientsControllerbulkCreatePatients);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - http://localhost:${PORT}`);
});

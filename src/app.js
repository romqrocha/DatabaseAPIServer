import CustomExpress from "./customExpress.js";
import PatientsController from "./controllers/patientsContoller.js"
import { handlePreflightRequest } from "./controllers/preflight.js";
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8000;
const patientsController = new PatientsController();
const app = new CustomExpress();

app.get("/api/sqlquery", patientsController.select);
app.post("/api/sqlquery", patientsController.insert);
app.post("/api/patients", patientsController.bulkCreatePatients);

// CORS preflight request endpoints
app.options("/api/sqlquery", handlePreflightRequest);
app.options("/api/patients", handlePreflightRequest);

app.listen(port, () => {
  console.log(`Server running on port ${port} - http://localhost:${port}`);
});

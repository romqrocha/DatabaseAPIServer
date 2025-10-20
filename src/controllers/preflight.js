import { ALLOWED_ORIGINS } from "../constants/allowedOrigins.js";
import { HTTP_STATUS_CODES } from "../constants/httpResponse.js";

export const handlePreflightRequest = (req, res) => {
  res.writeHead(
    HTTP_STATUS_CODES.NO_CONTENT,
    { 
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    }
  );
  res.end();
}

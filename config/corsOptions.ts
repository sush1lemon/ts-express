import cors from "cors";
import allowedOrigins from "./allowedOrigins";

const corsOptions: cors.CorsOptions = {
    origin: allowedOrigins
};

export default corsOptions
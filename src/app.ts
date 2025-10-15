import express from "express";
import cors from "cors";
import routes from "./presentation/routes/index";
import { errorHandler } from "./core/middlewares/errorHandler";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());


app.get("/", (_req, res) => res.send("API OK"));
app.use("/api", routes);

app.use(errorHandler);

export default app;

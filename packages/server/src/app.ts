import cors from "cors";
import express from "express";
import errorHandler from "./middleware/errorHandler";
import notFound from "./middleware/notFound";
import contactRoutes from "./routes/contactRoutes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use("/api/contacts", contactRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

import { Router } from "express";
import {
  getContactActivities,
  getContactById,
  getContacts,
  getTags,
  postBulkTags,
  postContact,
  putContact,
} from "../controllers/contactController";

const contactRoutes = Router();

contactRoutes.get("/", getContacts);
contactRoutes.get("/tags", getTags);
contactRoutes.post("/", postContact);
contactRoutes.post("/bulk-tags", postBulkTags);
contactRoutes.get("/:id/activities", getContactActivities);
contactRoutes.get("/:id", getContactById);
contactRoutes.put("/:id", putContact);

export default contactRoutes;

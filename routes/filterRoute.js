import express from "express";
import { getCustomers } from "../controllers/filterController.js";

const router = express.Router();

router.get("/customers", getCustomers);

export default router;
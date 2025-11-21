import express from "express";
import { importBillsData } from "../controllers/billsDataController.js";

const router = express.Router();

router.post("/import-bills", importBillsData);

export default router;

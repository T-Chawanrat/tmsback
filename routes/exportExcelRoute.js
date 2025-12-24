import express from "express";
import { exportBillsDataExcel } from "../controllers/exportExcelController.js";

const router = express.Router();
router.get("/export-billreport", exportBillsDataExcel);

export default router;

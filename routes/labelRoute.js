import express from "express";
import { getPrintLabels } from "../controllers/labelController.js";

const router = express.Router();

router.get("/print-labels", getPrintLabels);

export default router;

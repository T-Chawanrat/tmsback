import express from "express";
import { getPrintLabels, getReprintLabels } from "../controllers/labelController.js";

const router = express.Router();

router.get("/print-labels", getPrintLabels);
router.get("/reprint-labels", getReprintLabels);

export default router;

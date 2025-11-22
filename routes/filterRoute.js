import express from "express";
import { getCustomers, getWarehouses } from "../controllers/filterController.js";

const router = express.Router();

router.get("/customers", getCustomers);
router.get("/warehouses", getWarehouses);

export default router;
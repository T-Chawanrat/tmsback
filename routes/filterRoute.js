import express from "express";
import { getCustomers, getWarehouses, searchAddress } from "../controllers/filterController.js";

const router = express.Router();

router.get("/customers", getCustomers);
router.get("/warehouses", getWarehouses);
router.get("/address-search", searchAddress);


export default router;
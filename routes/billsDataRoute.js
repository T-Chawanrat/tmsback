import express from "express";
import {
  importBillsData,
  updateBillsWarehouseAccept,
  getBillsWarehouse,
} from "../controllers/billsDataController.js";

const router = express.Router();

router.post("/import-bills", importBillsData);
router.get("/bills-warehouse", getBillsWarehouse);
router.post("/bills-warehouse/accept", updateBillsWarehouseAccept);

export default router;

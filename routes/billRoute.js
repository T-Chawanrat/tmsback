import express from "express";
import {
  createBill,
  getBill,
  getBills,
  downloadImage,
  getBillsBySerial,
  updateBillImages,
} from "../controllers/billController.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/bills",
  upload.fields([
    { name: "images", maxCount: 8 },
    { name: "signature", maxCount: 1 },
  ]),
  createBill
);

router.put(
  "/bills/:id/images",
  upload.array("new_files[]", 10),
  updateBillImages
);

router.get("/bills/:id", getBill);
router.get("/bills", getBills);
router.get("/bills/:id/downloadImage", downloadImage);
router.get("/serial", getBillsBySerial);

export default router;

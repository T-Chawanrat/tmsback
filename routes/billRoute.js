import express from "express";
import {
  createBill,
  getBill,
  getBills,
  downloadImage,
  getBillsBySerial,
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

router.get("/bills/:id", getBill);
router.get("/bills", getBills);
router.get("/bills/:id/downloadImage", downloadImage);
router.get("/serial", getBillsBySerial);


export default router;

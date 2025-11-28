// import db from "../config/db.js";

// export const getBillsDataByUser = async (req, res) => {
//   let connection;

//   try {
//     // ดึง user_id จาก token (req.user) หรือ จาก query (?user_id=1)
//     const userId = req.user?.user_id || req.query.user_id;

//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "กรุณาระบุ user_id หรือ login ให้เรียบร้อย",
//       });
//     }

//     connection = await db.getConnection();

//     const [rows] = await connection.query(
//       `
//       SELECT *
//       FROM bills_data
//       WHERE user_id = ?
//       AND customer_input = 'Y'
//       AND create_date = CURDATE()
//       ORDER BY id DESC
//       `,
//       [userId]
//     );

//     return res.status(200).json({
//       success: true,
//       count: rows.length,
//       data: rows,
//     });
//   } catch (err) {
//     console.error("Error getBillsDataByUser:", err);
//     return res.status(500).json({
//       success: false,
//       message: "เกิดข้อผิดพลาดในการดึงข้อมูล bills_data ตาม user",
//       error: err.message,
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };

// controllers/labelController.js
import fs from "fs";
import path from "path";
import bwipjs from "bwip-js";
import QRCode from "qrcode";
import db from "../config/db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// โฟลเดอร์เก็บรูป labels (อยู่ระดับเดียวกับ server.js)
const LABEL_DIR = path.join(__dirname, "..", "labels");

// กันชื่อไฟล์เพี้ยน
const sanitize = (text) => {
  return String(text || "").replace(/[^a-zA-Z0-9_-]/g, "_");
};

// ✅ สร้าง barcode (ถ้ายังไม่มี)
const generateBarcode = async (serial) => {
  const clean = sanitize(serial);
  const filename = `barcode_${clean}.png`;
  const filepath = path.join(LABEL_DIR, filename);

  if (!fs.existsSync(filepath)) {
    const png = await bwipjs.toBuffer({
      bcid: "code128",
      text: String(serial),
      scale: 3,
      height: 10,
      includetext: false,
    });

    await fs.promises.writeFile(filepath, png);
  }

  return filename;
};

const generateQR = async (serial) => {
  const clean = sanitize(serial);
  const filename = `qr_${clean}.png`;
  const filepath = path.join(LABEL_DIR, filename);

  if (!fs.existsSync(filepath)) {
    await QRCode.toFile(filepath, String(serial), {
      width: 200,
      margin: 1,
    });
  }

  return filename;
};

export const getPrintLabels = async (req, res) => {
  let connection;

  try {
    const userId = req.user?.user_id || req.query.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ user_id หรือ login ให้เรียบร้อย",
      });
    }

    await fs.promises.mkdir(LABEL_DIR, { recursive: true });

    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM bills_data
      WHERE user_id = ?
        AND customer_input = 'Y'
        AND create_date = CURDATE()
      ORDER BY id DESC
      `,
      [userId]
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const result = await Promise.all(
      rows.map(async (row) => {
        const serial = row.SERIAL_NO;

        if (!serial) {
          return {
            ...row,
            barcode_url: null,
            qr_url: null,
          };
        }

        const barcodeFile = await generateBarcode(serial);
        const qrFile = await generateQR(serial);

        return {
          ...row,
          barcode_url: `${baseUrl}/labels/${barcodeFile}`,
          qr_url: `${baseUrl}/labels/${qrFile}`,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Error getPrintLabels:", err);
    return res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล/สร้าง Label",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

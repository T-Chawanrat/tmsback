// // middleware/upload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dir = "uploads";
//     if (!fs.existsSync(dir)) fs.mkdirSync(dir);
//     cb(null, dir);
//   },
//   filename: (req, file, cb) => {
//     if (file.fieldname === "signature") {
//       cb(null, "signature_" + Date.now() + path.extname(file.originalname));
//     } else {
//       cb(null, "image_" + Date.now() + path.extname(file.originalname));
//     }
//   },
// });

// export const upload = multer({ 
//   storage,
//   limits: { files: 9 }
// });

// middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ⬇ ให้ __dirname ของไฟล์นี้
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇ ชี้ไปที่โฟลเดอร์ uploads เดียวกับที่ server.js ใช้ (อยู่คนละไฟล์ แต่คนละ level)
// server.js อยู่ที่ root, upload.js อยู่ใน /middlewares → เลยต้อง ".."
const uploadDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    if (file.fieldname === "signature") {
      cb(null, "signature_" + Date.now() + path.extname(file.originalname));
    } else {
      cb(null, "image_" + Date.now() + path.extname(file.originalname));
    }
  },
});

export const upload = multer({
  storage,
  limits: { files: 9 },
});

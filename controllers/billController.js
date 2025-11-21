import db from "../config/db.js";

export const createBill = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const {
      user_id,
      receive_code,
      name,
      surname,
      license_plate,
      warehouse_name,
      remark,
    } = req.body;

    const signatureFile = req.files?.signature ? req.files.signature[0] : null;
    const imageFiles = req.files?.images || [];

    console.log("Signature file:", signatureFile);
    console.log("Image files:", imageFiles);

    const [billResult] = await connection.query(
      `INSERT INTO bills (user_id, receive_code, name, surname, license_plate, warehouse_name, sign, remark) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        receive_code,
        name,
        surname,
        license_plate,
        warehouse_name,
        signatureFile ? signatureFile.path : null,
        remark,
      ]
    );

    const billId = billResult.insertId;

    if (imageFiles.length > 0) {
      const imageValues = imageFiles.map((file) => [billId, file.path]);

      await connection.query(
        `INSERT INTO bill_images (bill_id, image_url) VALUES ?`,
        [imageValues]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: "บันทึกสำเร็จ",
      id: billId,
      imageCount: imageFiles.length,
      hasSignature: !!signatureFile,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error creating bill:", err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการบันทึก",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

const DOMAIN = "https://xsendwork.com";

export const getBill = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const billId = req.params.id;

    const [billRows] = await connection.query(
      `SELECT * FROM bills WHERE id = ?`,
      [billId]
    );

    if (billRows.length === 0) {
      return res.status(404).json({ message: "ไม่พบบิลนี้" });
    }

    const bill = billRows[0];

    const [imageRows] = await connection.query(
      `SELECT image_url FROM bill_images WHERE bill_id = ?`,
      [billId]
    );

    // bill.images = imageRows.map((img) => img.image_url);

    bill.images = imageRows.map((img) =>
      img.image_url ? `${DOMAIN}/${img.image_url}` : null
    );

    if (bill.sign) {
      bill.sign = `${DOMAIN}/${bill.sign}`;
    }

    res.status(200).json({
      bill,
    });
  } catch (err) {
    console.error("Error getting bill:", err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

export const getBills = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const [bills] = await connection.query(
      `SELECT * FROM bills ORDER BY id DESC`
    );

    for (let bill of bills) {
      const [images] = await connection.query(
        `SELECT image_url FROM bill_images WHERE bill_id = ?`,
        [bill.id]
      );
      // bill.images = images.map((img) => img.image_url);
      bill.images = images.map((img) =>
        img.image_url ? `${DOMAIN}/${img.image_url}` : null
      );

      if (bill.sign) {
        bill.sign = `${DOMAIN}/${bill.sign}`;
      }
    }

    res.status(200).json({ bills });
  } catch (err) {
    console.error("Error getting bills:", err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

export const downloadImage = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const billId = req.params.id;

    const [billRows] = await connection.query(
      `SELECT sign FROM bills WHERE id = ?`,
      [billId]
    );

    if (billRows.length === 0) {
      return res.status(404).json({ message: "ไม่พบบิลนี้" });
    }

    const bill = billRows[0];

    const [imageRows] = await connection.query(
      `SELECT image_url FROM bill_images WHERE bill_id = ?`,
      [billId]
    );

    const DOMAIN = "https://xsendwork.com";
    const fileUrls = [];

    if (bill.sign) {
      fileUrls.push(`${DOMAIN}/${bill.sign}`);
    }

    for (const img of imageRows) {
      if (img.image_url) {
        fileUrls.push(`${DOMAIN}/${img.image_url}`);
      }
    }

    res.status(200).json({ files: fileUrls });
  } catch (err) {
    console.error("Error in downloadImage:", err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในการดึงไฟล์",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

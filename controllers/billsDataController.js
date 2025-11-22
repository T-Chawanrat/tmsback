import db from "../config/db.js";

// แปลง Excel serial → JS date → 'YYYY-MM-DD'
const excelDateToMySQL = (input) => {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "string" && input.includes("-")) return input;
  const serial =
    typeof input === "number" ? input : parseFloat(String(input).trim());
  if (!serial || isNaN(serial)) return null;
  const jsDate = new Date((serial - 25569) * 86400 * 1000);
  const iso = jsDate.toISOString().split("T")[0];
  return iso;
};

export const importBillsData = async (req, res) => {
  let connection;

  try {
    const { rows, user_id, type } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        message: "ไม่มีข้อมูลสำหรับนำเข้า",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const insertValues = rows.map((r) => [
      r.NO_BILL || null,
      r.REFERENCE || null,
      excelDateToMySQL(r.SEND_DATE) || null,
      r.CUSTOMER_NAME || null,
      r.RECIPIENT_CODE || null,
      r.RECIPIENT_NAME || null,
      r.RECIPIENT_TEL || null,
      r.RECIPIENT_ADDRESS || null,
      r.RECIPIENT_SUBDISTRICT || null,
      r.RECIPIENT_DISTRICT || null,
      r.RECIPIENT_PROVINCE || null,
      r.RECIPIENT_ZIPCODE || null,
      r.SERIAL_NO || null,
      user_id || null,
      type || "IMPORT",
    ]);

    await connection.query(
      `
      INSERT INTO bills_data 
      (
        NO_BILL, REFERENCE, SEND_DATE, CUSTOMER_NAME, RECIPIENT_CODE,
        RECIPIENT_NAME, RECIPIENT_TEL, RECIPIENT_ADDRESS,
        RECIPIENT_SUBDISTRICT, RECIPIENT_DISTRICT, RECIPIENT_PROVINCE,
        RECIPIENT_ZIPCODE, SERIAL_NO, user_id, type
      )
      VALUES ?
      `,
      [insertValues]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `นำเข้าข้อมูลสำเร็จ จำนวน ${rows.length} แถว`,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error while importing bills_data:", err);

    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดระหว่างนำเข้าข้อมูล",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

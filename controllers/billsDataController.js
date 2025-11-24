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

    // ✅ ดึงข้อมูล warehouse หลังจากมี connection แล้ว
    const [warehouseRows] = await connection.query(
      "SELECT warehouse_id, warehouse_name, zip_code FROM master_warehouses"
    );

    // ✅ ทำ map จาก zip_code → warehouse_id, warehouse_name
    const warehouseMap = {};
    warehouseRows.forEach((w) => {
      warehouseMap[w.zip_code] = {
        warehouse_id: w.warehouse_id,
        warehouse_name: w.warehouse_name,
      };
    });

    // ✅ เตรียมค่า insert
    const insertValues = rows.map((r) => {
      const w = warehouseMap[r.RECIPIENT_ZIPCODE] || {};

      return [
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
        w.warehouse_name || null, // ✅ ตรงกับ columns ด้านล่าง
        w.warehouse_id || null, // ✅
        type || "IMPORT",
      ];
    });

    await connection.query(
      `
      INSERT INTO bills_data 
      (
        NO_BILL, REFERENCE, SEND_DATE, CUSTOMER_NAME, RECIPIENT_CODE,
        RECIPIENT_NAME, RECIPIENT_TEL, RECIPIENT_ADDRESS,
        RECIPIENT_SUBDISTRICT, RECIPIENT_DISTRICT, RECIPIENT_PROVINCE,
        RECIPIENT_ZIPCODE, SERIAL_NO, user_id,
        warehouse_name, warehouse_id,  -- ✅ ลำดับให้ตรงกับ insertValues
        type
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

export const getBillsWarehouse = async (req, res) => {
  let connection;

  try {
    const { warehouse_accept = "N" } = req.query; // default = 'N'

    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT 
        id,
        NO_BILL,
        SERIAL_NO,
        CUSTOMER_NAME,
        warehouse_name
      FROM bills_data
      WHERE warehouse_accept = ?
      ORDER BY id ASC
      `,
      [warehouse_accept]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error("Error getBillsWarehouse:", err);
    res.status(500).json({
      success: false,
      message: "ไม่สามารถดึงข้อมูล bills_data สำหรับ Warehouse ได้",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};


export const updateBillsWarehouseAccept = async (req, res) => {
  let connection;

  try {
    const { serials, accept_flag = "Y" } = req.body;

    if (!serials || !Array.isArray(serials) || serials.length === 0) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ serials เป็น array",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // ใช้ IN (?) ให้ mysql2 ช่วยขยาย array
    await connection.query(
      `
      UPDATE bills_data
      SET warehouse_accept = ?
      WHERE SERIAL_NO IN (?)
      `,
      [accept_flag, serials]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: `อัปเดตสถานะ warehouse_accept = '${accept_flag}' ให้ ${serials.length} รายการเรียบร้อย`,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error updateBillsWarehouseAccept:", err);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดต warehouse_accept",
      error: err.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

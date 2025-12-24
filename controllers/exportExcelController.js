import db from "../config/db.js";
import { exportToExcel } from "../utils/excelExport.js";

export const exportBillsDataExcel = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const limit = Math.min(Number(req.query.limit || 50000), 50000);

    const [rows] = await connection.query(
      `
      SELECT
        SERIAL_NO, REFERENCE, CUSTOMER_NAME, RECIPIENT_CODE, RECIPIENT_NAME,
        RECIPIENT_TEL, RECIPIENT_ADDRESS, RECIPIENT_SUBDISTRICT, RECIPIENT_DISTRICT,
        RECIPIENT_PROVINCE, RECIPIENT_ZIPCODE, warehouse_name, type, customer_input,
        warehouse_accept, dc_accept
      FROM bills_data
      ORDER BY id DESC
      LIMIT ?
      `,
      [limit]
    );

    if (!rows?.length) return res.status(404).json({ message: "No data found" });

    const columns = [
      { header: "SERIAL_NO", key: "SERIAL_NO", width: 25 },
      { header: "REFERENCE", key: "REFERENCE", width: 25 },
      { header: "CUSTOMER_NAME", key: "CUSTOMER_NAME", width: 25 },
      { header: "RECIPIENT_CODE", key: "RECIPIENT_CODE", width: 25 },
      { header: "RECIPIENT_NAME", key: "RECIPIENT_NAME", width: 25 },
      { header: "RECIPIENT_TEL", key: "RECIPIENT_TEL", width: 25 },
      { header: "RECIPIENT_ADDRESS", key: "RECIPIENT_ADDRESS", width: 25 },
      { header: "RECIPIENT_SUBDISTRICT", key: "RECIPIENT_SUBDISTRICT", width: 25 },
      { header: "RECIPIENT_DISTRICT", key: "RECIPIENT_DISTRICT", width: 25 },
      { header: "RECIPIENT_PROVINCE", key: "RECIPIENT_PROVINCE", width: 25 },
      { header: "RECIPIENT_ZIPCODE", key: "RECIPIENT_ZIPCODE", width: 25 },
      { header: "warehouse_name", key: "warehouse_name", width: 25 },
      { header: "type", key: "type", width: 25 },
      { header: "customer_input", key: "customer_input", width: 25 },
      { header: "warehouse_accept", key: "warehouse_accept", width: 25 },
      { header: "dc_accept", key: "dc_accept", width: 25 },
    ];

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `bills_data_${timestamp}.xlsx`;

    return await exportToExcel(res, rows, columns, "bills_data", filename);
  } catch (err) {
    console.error("Export bills_data error:", err);
    return res.status(500).json({ message: "Export failed", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

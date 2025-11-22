import db from "../config/db.js";

export const getCustomers = async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM admin_tmg.um_customers 
      ORDER BY customer_name ASC
    `;
    const [rows] = await db.query(sql);

    res.json({
      data: rows,
      count: rows.length,
    });
  } catch (err) {
    console.error("getCustomers error:", err);
    res.status(500).json({ message: "An error occurred" });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const { zip_code } = req.query; // 👈 รับ zip_code จาก query

    let sql = `
      SELECT *
      FROM admin_tmg.master_warehouses
    `;
    const params = [];

    if (zip_code) {
      sql += ` WHERE zip_code = ?`;
      params.push(zip_code);
    }

    const [rows] = await db.query(sql, params);

    res.json({
      data: rows,
      count: rows.length,
    });
  } catch (err) {
    console.error("getWarehouses error:", err);
    res.status(500).json({ message: "An error occurred" });
  }
};


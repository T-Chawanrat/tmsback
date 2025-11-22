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
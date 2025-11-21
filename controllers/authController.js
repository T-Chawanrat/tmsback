// controllers/authController.js
import db from "../config/db.js";

export const login = async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก username และ password" });
    }

    connection = await db.getConnection();

    // ✅ แก้ไข query ตรงกับตารางจริง (ลบ is_actived, is_deleted, warehouse_name)
    const [rows] = await connection.query(
      `
SELECT 
  user_id,
  username,
  password,
  first_name,
  last_name,
  license_plate,
  dc_id,
  role_id
FROM um_users
WHERE username = ?
LIMIT 1
  `,
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้นี้" });
    }

    const user = rows[0];

    // ✅ ใช้ plain password เทียบตรง ๆ
    if (password !== user.password) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    // ✅ คืนข้อมูล user ตามโครงสร้างจริง
    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        license_plate: user.license_plate,
        dc_id: user.dc_id,           // ✅ ใช้ dc_id แทน warehouse_name
        role_id: user.role_id
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  } finally {
    if (connection) connection.release();
  }
};
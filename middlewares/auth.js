// // middlewares/auth.js
// import jwt from "jsonwebtoken";

// export const auth = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "ไม่มี Header Authorization" });
//   }

//   const parts = authHeader.split(" ");
//   if (parts.length !== 2 || parts[0] !== "Bearer") {
//     return res.status(401).json({ message: "รูปแบบ Token ไม่ถูกต้อง" });
//   }

//   const token = parts[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//   } catch (err) {
//     return res.status(401).json({ message: "Token ไม่ถูกต้องหรือหมดอายุ" });
//   }
// };

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const accessSecret = process.env.JWT_ACCESS_SECRET || "access_secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "refresh_secret";
const accessExp = process.env.ACCESS_TOKEN_EXP || "15m";
const refreshExp = process.env.REFRESH_TOKEN_EXP || "7d";

export function signAccess(payload: object) {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExp });
}
export function signRefresh(payload: object) {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExp });
}
export function verifyAccess(token: string) {
  return jwt.verify(token, accessSecret);
}
export function verifyRefresh(token: string) {
  return jwt.verify(token, refreshSecret);
}

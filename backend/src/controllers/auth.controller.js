import { registerUser } from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}
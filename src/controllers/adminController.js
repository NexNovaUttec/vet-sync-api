import { validateAdmin, validatePartialAdmin } from "../schemas/adminSchema";
import { adminModel } from "../models/adminModel";

export class AdminController {
  static async createAdmin(req, res) {
    const { data, error } = validateAdmin(req.body);

    if (error) return res.status(400).json({ error: error.flatten() });

    try {
      const admin = await adminModel.createAdmin({ input: data });
      return res.status(201).json({ message: "Admin created", data: admin });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

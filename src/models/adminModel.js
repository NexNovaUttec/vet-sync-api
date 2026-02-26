import { supabase } from "../database/index.js";

export class adminModel {
  static async createAdmin({ input }) {
    const { password } = input;
    const hashedPassword = await bcrypt.hash(password, 10);

    const jwtSecret = crypto.randomBytes(64).toString("hex");

    try {
      const { data: admin, error } = await supabase
        .from("admins")
        .insert({
          ...input,
          password: hashedPassword,
          jwt_secret: jwtSecret,
        })
        .select();

      if (error) throw new Error(error.message);

      return admin;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

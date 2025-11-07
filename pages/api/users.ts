import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../db";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";

type Data = {
  message: string;
  users?: any[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    if (req.method === "GET") {
      // Example: Get all users
      const allUsers = await db.select().from(user);
      res.status(200).json({ message: "Success", users: allUsers });
    } else if (req.method === "POST") {
      // Example: Create a new user
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }
      const newUser = await db.insert(user).values({ name, email }).returning();
      res.status(201).json({ message: "User created", users: newUser });
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


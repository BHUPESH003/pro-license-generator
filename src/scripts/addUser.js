import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ✅ Define your User model here (or import it if already defined elsewhere)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

// ✅ Config
const MONGODB_URI =
  "mongodb+srv://ygbhupesh003:Q12pXvN21rnkMIv3@cluster0.wl20kke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const email = "ygbhupesh003@gmail.com";
const plainPassword = "123456";
const name = "Bhupesh Yadav";

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("User already exists.");
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const user = await User.create({ email, password: hashedPassword, name });

    console.log("✅ User created:", user.email);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();

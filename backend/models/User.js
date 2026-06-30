import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userScema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Provide a valid email address."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minLength: [6, "Password must be at least 6 characters."],
      select: false,
    },
    role: {
      type: String,
      enum: ["owner", "member"],
      default: "owner",
    },
    company: { type: String, trim: true, default: "" },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

userScema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userScema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userScema);

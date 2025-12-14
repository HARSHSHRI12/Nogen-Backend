const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Signup Schema for storing user authentication details
const SignupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher"], required: true }, // Role-based authentication
    // avatar: { type: String }, // Optional: to store user avatar (e.g., profile picture)
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt timestamps

// Hash password before saving to the database
SignupSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash password if it's modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password with a salt of 10 rounds
  next();
});

// Method to compare passwords
SignupSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password); // Compare entered password with the stored hashed password
};

// Export the Signup model for authentication (not related to assistant data)
module.exports = mongoose.model("Signup", SignupSchema);

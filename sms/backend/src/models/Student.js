const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    roll: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Phone must be a 10-digit number"],
    },
    dept: {
      type: String,
      required: [true, "Department is required"],
      enum: {
        values: [
          "Computer Science",
          "Electronics",
          "Mechanical",
          "Civil",
          "Chemical",
          "Biotechnology",
        ],
        message: "{VALUE} is not a valid department",
      },
    },
    year: {
      type: String,
      required: [true, "Year is required"],
      enum: {
        values: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
        message: "{VALUE} is not a valid year",
      },
    },
    gpa: {
      type: Number,
      required: [true, "GPA is required"],
      min: [0, "GPA cannot be less than 0"],
      max: [10, "GPA cannot exceed 10"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index for faster search queries
studentSchema.index({ name: "text", email: "text", roll: "text" });

module.exports = mongoose.model("Student", studentSchema);

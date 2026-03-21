const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Student = require("../models/Student");

// ─── Validation Rules ────────────────────────────────────────────────────────
const studentValidation = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 100 }),
  body("roll").trim().notEmpty().withMessage("Roll number is required"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone").matches(/^\d{10}$/).withMessage("Phone must be 10 digits"),
  body("dept")
    .isIn(["Computer Science", "Electronics", "Mechanical", "Civil", "Chemical", "Biotechnology"])
    .withMessage("Invalid department"),
  body("year")
    .isIn(["1st Year", "2nd Year", "3rd Year", "4th Year"])
    .withMessage("Invalid year"),
  body("gpa").isFloat({ min: 0, max: 10 }).withMessage("GPA must be between 0 and 10"),
  body("status").optional().isIn(["Active", "Inactive"]).withMessage("Invalid status"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── GET /api/students ────────────────────────────────────────────────────────
// Supports: ?search=, ?dept=, ?status=, ?year=, ?page=, ?limit=, ?sort=, ?order=
router.get("/", async (req, res, next) => {
  try {
    const {
      search = "",
      dept,
      status,
      year,
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { roll: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (dept) filter.dept = dept;
    if (status) filter.status = status;
    if (year) filter.year = year;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = { [sort]: order === "asc" ? 1 : -1 };

    const [students, total] = await Promise.all([
      Student.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Student.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/students/stats ──────────────────────────────────────────────────
router.get("/stats", async (req, res, next) => {
  try {
    const [total, active, byDept, avgGpaResult] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: "Active" }),
      Student.aggregate([{ $group: { _id: "$dept", count: { $sum: 1 } } }]),
      Student.aggregate([{ $group: { _id: null, avg: { $avg: "$gpa" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        departments: byDept.length,
        byDept,
        avgGpa: avgGpaResult[0]?.avg?.toFixed(2) || "0.00",
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/students/:id ────────────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/students ───────────────────────────────────────────────────────
router.post("/", studentValidation, validate, async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: student,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/students/:id ────────────────────────────────────────────────────
router.put("/:id", studentValidation, validate, async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,          // return updated document
      runValidators: true, // run schema validators on update
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, message: "Student updated successfully", data: student });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/students/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, message: "Student deleted successfully", data: student });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

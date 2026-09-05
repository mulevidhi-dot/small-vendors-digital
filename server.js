const PORT = process.env.PORT || 3000;
const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// Serve static HTML/CSS/JS files
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "mysql-9f43400-gaurimulay79-89e.l.aivencloud.com",
  port: 28846,
  user: "avnadmin",
  password: process.env.DB_PASSWORD,
  database: "defaultdb",
  ssl: { rejectUnauthorized: false }
});

// Database Setup & Table Initializations
db.connect(err => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to MySQL database!");

    // 1. Recreate Survey Responses Table
    db.query("DROP TABLE IF EXISTS survey_responses", (err) => {
      if (err) return console.error("Error dropping survey table:", err.message);

      const createSurveyTable = `
        CREATE TABLE survey_responses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          digital_payment VARCHAR(50),
          upi VARCHAR(50),
          qr_code VARCHAR(50),
          problem VARCHAR(255),
          fraud_awareness VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      db.query(createSurveyTable, (err) => {
        if (err) console.error("Error creating survey table:", err.message);
        else console.log("Survey table freshly recreated with correct columns!");
      });
    });

    // 2. Auto-Create Vendor Details Table
    const createVendorTable = `
      CREATE TABLE IF NOT EXISTS vendor_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_name VARCHAR(255),
        business_type VARCHAR(100),
        mobile_number VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.query(createVendorTable, (err) => {
      if (err) console.error("Error creating vendor table:", err.message);
      else console.log("Vendor details table ready!");
    });
  }
});

// ================= API ROUTES =================

// Save Survey
app.post("/api/survey", (req, res) => {
  const { digital_payment, upi, qr_code, problem, fraud_awareness } = req.body;

  const sql = `
    INSERT INTO survey_responses (digital_payment, upi, qr_code, problem, fraud_awareness)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [digital_payment, upi, qr_code, problem, fraud_awareness], (err, result) => {
    if (err) {
      console.error("SQL Error:", err.message);
      return res.status(500).send("Error saving survey response");
    }
    res.status(200).send("Survey submitted successfully!");
  });
});

// Save Vendor Details
app.post("/api/vendor", (req, res) => {
  const { vendor_name, business_type, mobile_number } = req.body;

  const sql = `
    INSERT INTO vendor_details (vendor_name, business_type, mobile_number)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [vendor_name, business_type, mobile_number], (err, result) => {
    if (err) {
      console.error("SQL Vendor Error:", err.message);
      return res.status(500).send("Error saving vendor details");
    }
    res.status(200).send("Vendor details saved successfully!");
  });
});

// Save Record
app.post("/api/records", (req, res) => {
  const { sale, expense, record_date } = req.body;

  db.query(
    "INSERT INTO records (sale, expense, record_date) VALUES (?, ?, ?)",
    [sale, expense, record_date],
    err => {
      if (err) return res.status(500).json({ message: "Error saving record" });
      res.json({ message: "Record saved successfully!" });
    }
  );
});

// Get Report
app.get("/api/report", (req, res) => {
  db.query(
    "SELECT SUM(sale) totalSales, SUM(expense) totalExpense FROM records",
    (err, result) => {
      if (err) return res.status(500).json({ message: "Error getting report" });

      const sales = result[0].totalSales || 0;
      const expense = result[0].totalExpense || 0;

      res.json({
        totalSales: sales,
        totalExpense: expense,
        totalProfit: sales - expense
      });
    }
  );
});

// Get All Vendors
app.get("/api/vendors", (req, res) => {
  db.query("SELECT * FROM vendor_details ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching vendors" });
    res.json(results);
  });
});

// Get All Survey Responses
app.get("/api/surveys", (req, res) => {
  db.query("SELECT * FROM survey_responses ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching surveys" });
    res.json(results);
  });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

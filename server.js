const PORT = process.env.PORT || 3000;
const express = require("express");
const path = require("path");

// Serve static HTML/CSS/JS files from the 'public' folder
app.use(express.static(__dirname));
const mysql = require("mysql2");

const app = express();
const db = mysql.createConnection({
  host: "mysql-9f43400-gaurimulay79-89e.l.aivencloud.com",
  port: 28846,
  user: "avnadmin",
 password: process.env.DB_PASSWORD,
  database: "defaultdb",
  ssl: { rejectUnauthorized: false }
});

db.connect(err => {
    if (err) console.log("Database error:", err.message);
    else console.log("Connected to MySQL database!");
});

// Save Vendor
app.post("/api/vendors", (req, res) => {
    const { name, business_type, phone } = req.body;

    db.query(
        "INSERT INTO vendors (name, business_type, phone) VALUES (?, ?, ?)",
        [name, business_type, phone],
        err => {
            if (err) return res.status(500).json({ message: "Error saving vendor details" });
            res.json({ message: "Vendor details saved successfully!" });
        }
    );
});

// Save Survey
app.post("/api/survey", (req, res) => {
    const { digital_payment, upi, qr_code, problem, fraud_awareness } = req.body;

    db.query(
        "INSERT INTO survey_responses VALUES (NULL, ?, ?, ?, ?, ?)",
        [digital_payment, upi, qr_code, problem, fraud_awareness],
        err => {
            if (err) return res.status(500).json({ message: "Error saving survey response" });
            res.json({ message: "Survey submitted successfully!" });
        }
    );
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
    db.query("SELECT * FROM vendors ORDER BY id DESC", (err, results) => {
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
app.listen(3000, () => console.log(`Server running at http://localhost:3000`));

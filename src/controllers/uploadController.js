const multer = require("multer");
const xlsx = require("xlsx");
const moment = require("moment");
const Record = require("../models/Record");

// Configure Multer for file upload
const upload = multer({ storage: multer.memoryStorage() });

const processExcelFile = async (req, res) => {
  try {
    // Read the uploaded file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 0) {
      return res.status(400).json({ error: "Blank spreadsheet error: No sheets found in the file" });
    }

    let errors = [];
    let validRecords = [];
    let hasData = false;

    // Get the current month and year
    const currentMonth = moment().month() + 1; // Months are 0-based in moment.js
    const currentYear = moment().year();

    sheetNames.forEach((sheetName) => {
      // Read the sheet data and ensure empty cells are not ignored
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false });

      if (sheetData.length === 0) {
        return; // Skip empty sheets
      }
      
      hasData = true;

      sheetData.forEach((row, index) => {
        let errorMessages = [];

        // Validation checks
        if (!row.Name) errorMessages.push("Name is required");
        if (!row.Amount || isNaN(row.Amount) || row.Amount <= 0) 
            errorMessages.push("Amount must be a valid positive number");

        // Date field validation
        if (!row.Date) {
          errorMessages.push("Date field is missing");
        } else {
          // Check if date format is correct
          const dateMoment = moment(row.Date, "DD-MM-YYYY", true);
          if (!dateMoment.isValid()) {
            errorMessages.push("Date format is incorrect. Expected format: DD-MM-YYYY");
          } else {
            // Check if the date falls within the current month and year
            if (dateMoment.month() + 1 !== currentMonth || dateMoment.year() !== currentYear) {
              errorMessages.push("Date not present within current month and year");
            }
          }
        }

        // Verified field validation (Optional)
        if (row.Verified && !["Yes", "No"].includes(row.Verified)) {
          errorMessages.push("Verified must be 'Yes' or 'No' if present");
        }

        // If errors exist, add to errors array
        if (errorMessages.length > 0) {
          errors.push({ sheet: sheetName, row: index + 2, errors: errorMessages });
        } else {
          validRecords.push({
            name: row.Name,
            amount: row.Amount,
            date: moment(row.Date, "DD-MM-YYYY").toDate(), // Convert to JS Date Object
            verified: row.Verified || null, // Store null if not provided
          });
        }
      });
    });

    // If the entire spreadsheet is empty
    if (!hasData) {
      return res.status(400).json({ error: "Blank spreadsheet error: No data found in the file" });
    }

    // If there are errors, return error response
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Insert valid records into the database
    await Record.insertMany(validRecords);

    res.status(200).json({ message: "File processed successfully", insertedRecords: validRecords.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { upload, processExcelFile };

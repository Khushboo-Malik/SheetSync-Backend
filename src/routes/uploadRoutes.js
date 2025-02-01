const express = require("express");
const { upload, processExcelFile } = require("../controllers/uploadController");
const fileValidation = require("../middleware/fileValidation");

const router = express.Router();

router.post("/upload", upload.single("file"), fileValidation, processExcelFile);

module.exports = router;

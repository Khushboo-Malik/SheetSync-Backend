const fileValidation = (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const fileExtension = req.file.mimetype;
    if (fileExtension !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      return res.status(400).json({ error: "Only .xlsx files are allowed" });
    }
    
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 2MB" });
    }
  
    next();
  };
  
  module.exports = fileValidation;
  
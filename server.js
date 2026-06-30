// server.js
// Menjalankan server Express dan menyajikan file dari folder public

const express = require("express");
const app = express();

app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Server running di http://localhost:3000");
});

const express = require("express");
const cors = require("cors");
const path = require("path");
const contactRoutes = require('./modules/Contact/contact.routes');
const categoryRoutes = require('./modules/Category/category.routes');

const app = express();
app.use(express.json());
app.use(cors())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/contact', contactRoutes);
app.use("/api/category", categoryRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Fabric Luxure API");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

module.exports = app
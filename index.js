const express = require("express");
const fs = require("fs").promises;
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const dataFilePath = path.join(__dirname, "data", "data.json");

const getData = async () => {
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading data file:", error);
    return { books: [], readers: [] };
  }
};

const saveData = async (data) => {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error saving data file:", error);
  }
};

// Routes
app.get("/", (req, res) => {
  res.sendFile(dataFilePath);
});

app.get("/books", async (req, res) => {
  const data = await getData();
  res.json(data.books);
});

app.get("/readers", async (req, res) => {
  const data = await getData();
  res.json(data.readers);
});

app.get("/readers/:id", async (req, res) => {
  const data = await getData();
  const readerId = parseInt(req.params.id);
  const reader = data.readers.find((reader) => reader.id === readerId);
  if (!reader) {
    return res.status(404).json({ message: "Reader not found" });
  }
  res.json(reader);
});

app.post("/books", async (req, res) => {
  const data = await getData();
  const { id, title } = req.body;
  data.books.push({ id, title });
  await saveData(data);
  res.status(201).json({ message: "Book added successfully" });
});

app.post("/readers", async (req, res) => {
  const data = await getData();
  const { id, name, booksIssued } = req.body;
  data.readers.push({ id, name, booksIssued: booksIssued || [], hoursRead: 0 });
  await saveData(data);
  res.status(201).json({ message: "Reader added successfully" });
});

app.delete("/books/:id", async (req, res) => {
  const data = await getData();
  const bookId = parseInt(req.params.id);
  data.books = data.books.filter((book) => book.id !== bookId);
  await saveData(data);
  res.json({ message: "Book deleted successfully" });
});

app.delete("/readers/:id", async (req, res) => {
  const data = await getData();
  const readerId = parseInt(req.params.id);
  data.readers = data.readers.filter((reader) => reader.id !== readerId);
  await saveData(data);
  res.json({ message: "Reader deleted successfully" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

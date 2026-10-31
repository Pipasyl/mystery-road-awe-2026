import express from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// THEORY: the backend does not make up data. It reads the same JSON files the
// app loaded before and sends them out. It only gives data (GET), it never changes it.
const app = express();
const PORT = 3001;

// Where the JSON files live: public/data (one folder up from /server).
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(here, "..", "public", "data");

// Middleware = sees EVERY request before the route does. Test switches in the address:
//   ?delay=3000  -> answer after 3000 ms
//   ?error=true  -> answer with an error (status 500)
//   ?empty=true  -> NEW: answer successfully, but with an empty list
app.use("/api", (req, res, next) => {
  const delay = Number(req.query.delay) || 0;
  const shouldFail = req.query.error === "true";
  const shouldBeEmpty = req.query.empty === "true"; // NEW

  setTimeout(() => {
    if (shouldFail) {
      res.status(500).json({ error: "Fake error on purpose" });
      return;
    }
    // NEW: status 200 (success) but nothing inside. This is the "empty" case.
    if (shouldBeEmpty) {
      res.json([]);
      return;
    }
    next(); // go on to the real route (the one that reads the JSON file)
  }, delay);
});

// Builds one GET route from a file name.
function makeRoute(name) {
  app.get(`/api/${name}`, async (req, res) => {
    try {
      const text = await readFile(path.join(DATA_DIR, `${name}.json`), "utf-8");
      res.json(JSON.parse(text));
    } catch (err) {
      console.error(`Could not read ${name}.json`, err);
      res.status(500).json({ error: `Could not read ${name}` });
    }
  });
}

["case", "people", "locations", "evidence", "timeline"].forEach(makeRoute);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

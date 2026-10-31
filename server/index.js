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
// THEORY: middleware = a small function that sees EVERY request before the route does.
// It can wait, block, or let the request through with next().
// We use it to fake a slow or broken server, controlled by the address:
//   /api/people?delay=3000  -> answer after 3000 ms
//   /api/people?error=true  -> answer with an error (status 500)
app.use("/api", (req, res, next) => {
  const delay = Number(req.query.delay) || 0; // no ?delay -> 0 ms, so no waiting
  const shouldFail = req.query.error === "true";

  setTimeout(() => {
    if (shouldFail) {
      res.status(500).json({ error: "Fake error on purpose" });
      return; // stop here, the real route never runs
    }
    next(); // go on to the real route (the one that reads the JSON file)
  }, delay);
});
// Helper: builds one GET route from a file name.
// Example: makeRoute("people") -> GET /api/people sends public/data/people.json
function makeRoute(name) {
  app.get(`/api/${name}`, async (req, res) => {
    try {
      const text = await readFile(path.join(DATA_DIR, `${name}.json`), "utf-8");
      res.json(JSON.parse(text)); // parse first, so a broken file gives an error here
    } catch (err) {
      console.error(`Could not read ${name}.json`, err);
      res.status(500).json({ error: `Could not read ${name}` });
    }
  });
}

// One route per file the app already loads in api.ts.
["case", "people", "locations", "evidence", "timeline"].forEach(makeRoute);

// Kept from Task 1.
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

import express from "express";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const leadsFile = path.join(dataDir, "leads.json");
const distDir = path.join(rootDir, "dist");

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(express.json({ limit: "64kb" }));

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(leadsFile, "utf8");
  } catch {
    await writeFile(leadsFile, "[]", "utf8");
  }
}

async function readLeads() {
  await ensureStore();
  const raw = await readFile(leadsFile, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function writeLeads(leads) {
  await ensureStore();
  await writeFile(leadsFile, JSON.stringify(leads, null, 2), "utf8");
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/leads", async (_req, res) => {
  const leads = await readLeads();
  res.json({
    leads: leads.toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  });
});

app.get("/api/leads.csv", async (_req, res) => {
  const leads = await readLeads();
  const header = ["id", "name", "phone", "sourcePath", "campaign", "createdAt"];
  const rows = leads
    .toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((lead) =>
      header
        .map((field) => csvEscape(lead[field]))
        .join(",")
    );

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=ad-leads.csv");
  res.send(`\uFEFF${header.join(",")}\n${rows.join("\n")}`);
});

app.post("/api/leads", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  const consent = Boolean(req.body.consent);
  const sourcePath = String(req.body.sourcePath || "/").slice(0, 500);
  const campaign = String(req.body.campaign || "").slice(0, 120);

  if (name.length < 2) {
    return res.status(400).json({ error: "성함을 2글자 이상 입력해주세요." });
  }

  if (!/^01\d{8,9}$/.test(phone)) {
    return res.status(400).json({ error: "연락처는 01012345678 형식으로 입력해주세요." });
  }

  if (!consent) {
    return res.status(400).json({ error: "정보제공동의가 필요합니다." });
  }

  const leads = await readLeads();
  const lead = {
    id: randomUUID(),
    name,
    phone,
    sourcePath,
    campaign,
    createdAt: new Date().toISOString(),
    userAgent: String(req.headers["user-agent"] || "").slice(0, 300),
  };

  leads.push(lead);
  await writeLeads(leads);

  res.status(201).json({ lead });
});

app.use(express.static(distDir));

app.use((_req, res, next) => {
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) next();
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Ad DB server running at http://127.0.0.1:${port}`);
});

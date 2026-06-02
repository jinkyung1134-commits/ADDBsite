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
const settingsFile = path.join(dataDir, "site-settings.json");
const distDir = path.join(rootDir, "dist");

const app = express();
const port = Number(process.env.PORT || 8787);
const adminUser = process.env.ADMIN_USER || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "";

app.use(express.json({ limit: "64kb" }));

const defaultSiteSettings = {
  kicker: "선착순 안내방 신청",
  title: "무료 안내방 신청",
  videoBadge: "상세 안내 공개",
  videoTitle: "신청 후 안내방에서 확인하세요",
  countdownLabel: "신청 마감까지",
  countdownValue: "오늘 마감",
  peopleLabel: "현재 신청 대기",
  peopleValue: "278명",
  nameLabel: "성함",
  namePlaceholder: "예시) 홍길동",
  phoneLabel: "연락처",
  phonePlaceholder: "예시) 01012345678 (- 제외)",
  consentTitle: "정보제공동의",
  consentText: "신청 시, 개인정보 수집 및 이용에 동의한 것으로 간주됩니다.",
  submitText: "지금 신청하기",
  secureNote: "입력한 정보는 안전하게 저장됩니다.",
  successTitle: "신청이 완료되었습니다.",
  successText: "{name}님, 안내방 초대 정보를 전송해드릴게요.",
  sideTitle: "소재별 문구를 관리자에서 바로 수정할 수 있습니다.",
  sideText: "광고 링크로 들어온 신청 데이터는 관리자 화면에 저장되고, 랜딩 문구는 설정 탭에서 바꿀 수 있습니다.",
};

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

function normalizeSettings(input) {
  return Object.fromEntries(
    Object.entries(defaultSiteSettings).map(([key, fallback]) => {
      const value = input && Object.hasOwn(input, key) ? input[key] : fallback;
      const text = String(value ?? fallback).trim();
      return [key, text.slice(0, 500) || fallback];
    })
  );
}

async function readSiteSettings() {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(settingsFile, "utf8");
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return defaultSiteSettings;
  }
}

async function writeSiteSettings(settings) {
  await mkdir(dataDir, { recursive: true });
  const normalized = normalizeSettings(settings);
  await writeFile(settingsFile, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

function normalizePhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function isAdminRequest(req) {
  if (!adminPassword) return true;

  const header = String(req.headers.authorization || "");
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  const separator = decoded.indexOf(":");
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);
  return username === adminUser && password === adminPassword;
}

function requireAdmin(req, res, next) {
  if (isAdminRequest(req)) {
    return next();
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="ADDBsite Admin"');
  return res.status(401).send("관리자 인증이 필요합니다.");
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/admin-config", (_req, res) => {
  res.json({ adminProtected: Boolean(adminPassword), adminUser });
});

app.get("/api/site-settings", async (_req, res) => {
  res.json({ settings: await readSiteSettings() });
});

app.put("/api/site-settings", requireAdmin, async (req, res) => {
  const settings = await writeSiteSettings(req.body.settings || {});
  res.json({ settings });
});

app.get("/api/leads", requireAdmin, async (_req, res) => {
  const leads = await readLeads();
  res.json({
    leads: leads.toSorted((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
  });
});

app.get("/api/leads.csv", requireAdmin, async (_req, res) => {
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

app.use("/admin", requireAdmin);

app.use((_req, res, next) => {
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) next();
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Ad DB server running at http://127.0.0.1:${port}`);
});

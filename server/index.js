import express from "express";
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const uploadsDir = path.join(dataDir, "uploads");
const leadsFile = path.join(dataDir, "leads.json");
const settingsFile = path.join(dataDir, "site-settings.json");
const distDir = path.join(rootDir, "dist");

const app = express();
const port = Number(process.env.PORT || 8787);
const adminUser = process.env.ADMIN_USER || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "";

app.use(express.json({ limit: "5mb" }));

const uploadExtensionByMime = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

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
  pageBackground: "#08090d",
  pageTextColor: "#f8f9ff",
  accentColor: "#7c4dff",
  fontFamily: "Pretendard, Inter, system-ui, sans-serif",
  kakaoFloatingImage: "",
  kakaoOpenChatUrl: "",
  kakaoFloatingAlt: "카카오톡 오픈채팅 바로가기",
  blocks: [
    {
      id: "intro",
      type: "text",
      kicker: "선착순 안내방 신청",
      title: "무료 안내방 신청",
      body: "",
      titleSize: "31",
      titleColor: "#ffffff",
      bodySize: "15",
      bodyColor: "#a9adba",
      fontFamily: "inherit",
    },
    {
      id: "main-photo",
      type: "photo",
      mediaType: "image",
      mediaSrc: "/images/ad-video-thumbnail.png",
      imageSrc: "/images/ad-video-thumbnail.png",
      badge: "상세 안내 공개",
      title: "신청 후 안내방에서 확인하세요",
    },
    {
      id: "numbers",
      type: "stats",
      items: [
        { icon: "flame", label: "신청 마감까지", value: "오늘 마감" },
        { icon: "users", label: "현재 신청 대기", value: "278명" },
      ],
    },
    {
      id: "lead-form",
      type: "form",
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
    },
  ],
};

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  await mkdir(uploadsDir, { recursive: true });
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

function sanitizeText(value, fallback = "", maxLength = 500) {
  const text = String(value ?? fallback).trim();
  return (text || fallback).slice(0, maxLength);
}

function isAllowedUploadMime(mimeType) {
  return mimeType.startsWith("image/") || mimeType.startsWith("video/");
}

function extensionForUpload(mimeType, originalName = "") {
  const mapped = uploadExtensionByMime[mimeType];
  if (mapped) return mapped;

  const originalExtension = path.extname(originalName).toLowerCase();
  if (/^\.[a-z0-9]{2,8}$/.test(originalExtension)) return originalExtension;

  return mimeType.startsWith("video/") ? ".mp4" : ".png";
}

async function saveUploadBuffer(buffer, mimeType, originalName = "") {
  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    throw new Error("업로드할 파일이 없습니다.");
  }

  if (!isAllowedUploadMime(mimeType)) {
    throw new Error("사진 또는 동영상 파일만 업로드할 수 있습니다.");
  }

  const maxBytes = mimeType.startsWith("video/") ? 80 * 1024 * 1024 : 40 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    throw new Error(mimeType.startsWith("video/") ? "동영상은 80MB 이하로 올려주세요." : "사진은 40MB 이하로 올려주세요.");
  }

  const mediaDirName = mimeType.startsWith("video/") ? "videos" : "images";
  const mediaDir = path.join(uploadsDir, mediaDirName);
  await mkdir(mediaDir, { recursive: true });

  const extension = extensionForUpload(mimeType, originalName);
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  await writeFile(path.join(mediaDir, fileName), buffer);

  return `/uploads/${mediaDirName}/${fileName}`;
}

async function externalizeDataUrl(value, originalName = "") {
  if (typeof value !== "string" || !value.startsWith("data:")) return value;

  const match = value.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) return value;

  const mimeType = match[1].toLowerCase();
  if (!isAllowedUploadMime(mimeType)) return value;

  const buffer = Buffer.from(match[2], "base64");
  return saveUploadBuffer(buffer, mimeType, originalName);
}

async function externalizeEmbeddedUploads(settings) {
  let changed = false;
  const nextSettings = {
    ...settings,
    blocks: settings.blocks.map((block) => ({ ...block })),
  };

  const nextKakaoImage = await externalizeDataUrl(nextSettings.kakaoFloatingImage, "kakao-floating");
  if (nextKakaoImage !== nextSettings.kakaoFloatingImage) {
    nextSettings.kakaoFloatingImage = nextKakaoImage;
    changed = true;
  }

  for (const block of nextSettings.blocks) {
    if (block.type !== "photo") continue;

    const currentMedia = block.mediaSrc || block.imageSrc || "";
    const nextMedia = await externalizeDataUrl(currentMedia, block.mediaType === "video" ? "media-video" : "media-image");
    if (nextMedia !== currentMedia) {
      block.mediaSrc = nextMedia;
      block.imageSrc = nextMedia;
      changed = true;
    }
  }

  return { changed, settings: nextSettings };
}

const siteSettingLimits = {
  kakaoFloatingImage: 18_000_000,
  kakaoOpenChatUrl: 2_000,
  kakaoFloatingAlt: 160,
};

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return defaultSiteSettings.blocks;

  return blocks
    .map((block, index) => {
      const id = sanitizeText(block.id, `block-${index}`, 80);

      if (block.type === "photo") {
        const mediaType = block.mediaType === "video" ? "video" : "image";
        const mediaFallback = mediaType === "video" ? "" : "/images/ad-video-thumbnail.png";
        const mediaSrc = sanitizeText(block.mediaSrc || block.imageSrc, mediaFallback, 55_000_000);
        return {
          id,
          type: "photo",
          mediaType,
          mediaSrc,
          imageSrc: mediaSrc,
          badge: sanitizeText(block.badge, "상세 안내 공개", 120),
          title: sanitizeText(block.title, "신청 후 안내방에서 확인하세요", 200),
        };
      }

      if (block.type === "stats") {
        const items = Array.isArray(block.items) && block.items.length ? block.items : defaultSiteSettings.blocks[2].items;
        return {
          id,
          type: "stats",
          items: items.slice(0, 4).map((item, itemIndex) => ({
            icon: sanitizeText(item.icon, itemIndex === 0 ? "flame" : "users", 30),
            label: sanitizeText(item.label, itemIndex === 0 ? "신청 마감까지" : "현재 신청 대기", 80),
            value: sanitizeText(item.value, itemIndex === 0 ? "오늘 마감" : "278명", 80),
          })),
        };
      }

      if (block.type === "form") {
        return {
          id,
          type: "form",
          nameLabel: sanitizeText(block.nameLabel, "성함", 80),
          namePlaceholder: sanitizeText(block.namePlaceholder, "예시) 홍길동", 120),
          phoneLabel: sanitizeText(block.phoneLabel, "연락처", 80),
          phonePlaceholder: sanitizeText(block.phonePlaceholder, "예시) 01012345678 (- 제외)", 120),
          consentTitle: sanitizeText(block.consentTitle, "정보제공동의", 80),
          consentText: sanitizeText(block.consentText, "신청 시, 개인정보 수집 및 이용에 동의한 것으로 간주됩니다.", 500),
          submitText: sanitizeText(block.submitText, "지금 신청하기", 80),
          secureNote: sanitizeText(block.secureNote, "입력한 정보는 안전하게 저장됩니다.", 160),
          successTitle: sanitizeText(block.successTitle, "신청이 완료되었습니다.", 120),
          successText: sanitizeText(block.successText, "{name}님, 안내방 초대 정보를 전송해드릴게요.", 300),
        };
      }

      return {
        id,
        type: "text",
        kicker: sanitizeText(block.kicker, "", 120),
        title: sanitizeText(block.title, "새 문구", 200),
        body: sanitizeText(block.body, "", 800),
        titleSize: sanitizeText(block.titleSize, "31", 4),
        titleColor: sanitizeText(block.titleColor, "#ffffff", 24),
        bodySize: sanitizeText(block.bodySize, "15", 4),
        bodyColor: sanitizeText(block.bodyColor, "#a9adba", 24),
        fontFamily: sanitizeText(block.fontFamily, "inherit", 180),
      };
    })
    .slice(0, 20);
}

function normalizeSettings(input) {
  return {
    ...Object.fromEntries(
      Object.entries(defaultSiteSettings)
        .filter(([key]) => key !== "blocks")
        .map(([key, fallback]) => [key, sanitizeText(input?.[key], fallback, siteSettingLimits[key] || 500)])
    ),
    blocks: normalizeBlocks(input?.blocks),
  };
}

async function readSiteSettings() {
  await ensureStore();
  try {
    const raw = await readFile(settingsFile, "utf8");
    const normalized = normalizeSettings(JSON.parse(raw));
    const { changed, settings } = await externalizeEmbeddedUploads(normalized);
    if (changed) {
      await writeFile(settingsFile, JSON.stringify(settings, null, 2), "utf8");
    }
    return settings;
  } catch {
    return defaultSiteSettings;
  }
}

async function writeSiteSettings(settings) {
  await ensureStore();
  const normalized = normalizeSettings(settings);
  const { settings: externalized } = await externalizeEmbeddedUploads(normalized);
  await writeFile(settingsFile, JSON.stringify(externalized, null, 2), "utf8");
  return externalized;
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
  res.setHeader("Cache-Control", "no-store");
  res.json({ settings: await readSiteSettings() });
});

app.put("/api/site-settings", requireAdmin, async (req, res) => {
  const settings = await writeSiteSettings(req.body.settings || {});
  res.json({ settings });
});

app.post("/api/uploads", requireAdmin, express.raw({ type: "*/*", limit: "80mb" }), async (req, res) => {
  try {
    const mimeType = String(req.headers["content-type"] || "").split(";")[0].toLowerCase();
    const originalName = String(req.headers["x-file-name"] || "");
    const url = await saveUploadBuffer(req.body, mimeType, originalName);

    res.status(201).json({
      url,
      mimeType,
      size: req.body.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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

app.use("/uploads", express.static(uploadsDir, { maxAge: "30d" }));
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

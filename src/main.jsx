import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Copy,
  DatabaseZap,
  Download,
  ExternalLink,
  Flame,
  Link as LinkIcon,
  LockKeyhole,
  Menu,
  ImagePlus,
  Phone,
  Play,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Settings,
  ShieldCheck,
  Type,
  User,
  Users,
} from "lucide-react";
import "./styles.css";

const openChatUrl = import.meta.env.VITE_OPEN_CHAT_URL || "";
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

function cloneDefaultSettings() {
  return JSON.parse(JSON.stringify(defaultSiteSettings));
}

function mergeSiteSettings(settings) {
  const defaults = cloneDefaultSettings();
  return {
    ...defaults,
    ...(settings || {}),
    blocks: Array.isArray(settings?.blocks) && settings.blocks.length ? settings.blocks : defaults.blocks,
  };
}

function createBlock(type) {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (type === "photo" || type === "video") {
    const isVideo = type === "video";
    return {
      id,
      type: "photo",
      mediaType: isVideo ? "video" : "image",
      mediaSrc: isVideo ? "" : "/images/ad-video-thumbnail.png",
      imageSrc: isVideo ? "" : "/images/ad-video-thumbnail.png",
      badge: isVideo ? "동영상 설명" : "사진 설명",
      title: isVideo ? "동영상 제목을 입력하세요" : "사진 제목을 입력하세요",
    };
  }

  if (type === "form") {
    return {
      id,
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
    };
  }

  return {
    id,
    type: "text",
    kicker: "",
    title: "새 글 제목",
    body: "설명 문구를 입력하세요.",
    titleSize: "31",
    titleColor: "#ffffff",
    bodySize: "15",
    bodyColor: "#a9adba",
    fontFamily: "inherit",
  };
}

const fontOptions = [
  { label: "기본 고딕", value: "Pretendard, Inter, system-ui, sans-serif" },
  { label: "굵은 고딕", value: "'Arial Black', 'Malgun Gothic', sans-serif" },
  { label: "부드러운 고딕", value: "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" },
  { label: "명조", value: "Georgia, 'Noto Serif KR', serif" },
];

function getThemeStyle(settings) {
  return {
    "--page-bg": settings.pageBackground || defaultSiteSettings.pageBackground,
    "--page-text": settings.pageTextColor || defaultSiteSettings.pageTextColor,
    "--accent": settings.accentColor || defaultSiteSettings.accentColor,
    fontFamily: settings.fontFamily || defaultSiteSettings.fontFamily,
  };
}

function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? <AdminPage /> : <LeadPage />;
}

function Brand() {
  return (
    <div className="brand" aria-label="애드스파크">
      <span className="brand-mark">
        <DatabaseZap size={21} />
      </span>
      <span>
        <strong>애드스파크</strong>
        <small>광고로 신청받는 DB 수집툴</small>
      </span>
    </div>
  );
}

function LeadPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    consent: true,
  });
  const [siteSettings, setSiteSettings] = useState(() => cloneDefaultSettings());
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [savedLead, setSavedLead] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const campaign = params.get("campaign") || params.get("utm_campaign") || "";
  const sourcePath = `${window.location.pathname}${window.location.search}`;
  const phoneDigits = form.phone.replace(/[^\d]/g, "");
  const canSubmit = form.name.trim().length >= 2 && /^01\d{8,9}$/.test(phoneDigits) && form.consent;

  useEffect(() => {
    let isMounted = true;

    async function loadSiteSettings() {
      try {
        const response = await fetch("/api/site-settings");
        const payload = await response.json();
        if (isMounted && payload.settings) {
          setSiteSettings(mergeSiteSettings(payload.settings));
        }
      } catch {
        if (isMounted) setSiteSettings(cloneDefaultSettings());
      }
    }

    loadSiteSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  async function submitLead(event) {
    event.preventDefault();
    if (!canSubmit || status === "submitting") return;

    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: phoneDigits,
          sourcePath,
          campaign,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "신청 정보를 저장하지 못했습니다.");
      }

      setSavedLead(payload.lead);
      setStatus("success");
    } catch (requestError) {
      setError(requestError.message);
      setStatus("idle");
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="lead-page" style={getThemeStyle(siteSettings)}>
      <section className="lead-stage" aria-label="광고 DB 신청 페이지">
        <div className="phone-frame">
          <div className="lead-content">
            {siteSettings.blocks.map((block) => {
              if (block.type === "photo") return <PhotoBlock block={block} key={block.id} />;
              if (block.type === "stats") return <StatsBlock block={block} key={block.id} />;
              if (block.type === "form") {
                return (
                  <LeadFormBlock
                    block={block}
                    canSubmit={canSubmit}
                    error={error}
                    form={form}
                    key={block.id}
                    savedLead={savedLead}
                    status={status}
                    submitLead={submitLead}
                    updateField={updateField}
                  />
                );
              }
              return <TextBlock block={block} key={block.id} />;
            })}
          </div>
        </div>

        <aside className="lead-side-panel" aria-label="광고 운영 요약">
          <h2>{siteSettings.sideTitle}</h2>
          <p>{siteSettings.sideText}</p>
          <div className="side-grid">
            <Metric icon={<User size={18} />} value={siteSettings.nameLabel} label="필수 입력" />
            <Metric icon={<Phone size={18} />} value={siteSettings.phoneLabel} label="숫자만 저장" />
            <Metric icon={<ShieldCheck size={18} />} value={siteSettings.consentTitle} label="체크 상태 기록" />
            <Metric icon={<BarChart3 size={18} />} value="유입 링크" label="광고별 분리" />
          </div>
          <a className="secondary-link" href="/admin">
            광고 DB 관리 열기
            <ExternalLink size={17} />
          </a>
        </aside>
      </section>
    </main>
  );
}

function TextBlock({ block }) {
  const titleStyle = {
    color: block.titleColor || "#ffffff",
    fontFamily: block.fontFamily === "inherit" ? "inherit" : block.fontFamily,
    fontSize: `${Number(block.titleSize) || 31}px`,
  };
  const bodyStyle = {
    color: block.bodyColor || "#a9adba",
    fontFamily: block.fontFamily === "inherit" ? "inherit" : block.fontFamily,
    fontSize: `${Number(block.bodySize) || 15}px`,
  };

  return (
    <div className="lead-heading">
      {block.kicker ? <p>{block.kicker}</p> : null}
      <h1 style={titleStyle}>{block.title}</h1>
      {block.body ? <p className="lead-body-copy" style={bodyStyle}>{block.body}</p> : null}
    </div>
  );
}

function PhotoBlock({ block }) {
  const mediaSrc = block.mediaSrc || block.imageSrc || "/images/ad-video-thumbnail.png";
  const isVideo = block.mediaType === "video";

  return (
    <article className={`video-panel ${isVideo ? "video-media" : ""}`}>
      {isVideo ? (
        <video src={mediaSrc} controls playsInline preload="metadata" />
      ) : (
        <img src={mediaSrc} alt="신청 페이지 사진" />
      )}
      {!isVideo ? (
        <>
          <div className="video-shade" />
          <div className="video-copy">
            {block.badge ? <span>{block.badge}</span> : null}
            {block.title ? <strong>{block.title}</strong> : null}
          </div>
        </>
      ) : null}
    </article>
  );
}

function StatsBlock({ block }) {
  const items = Array.isArray(block.items) && block.items.length ? block.items : defaultSiteSettings.blocks[2].items;

  return (
    <div className="live-row" aria-label="신청 현황">
      {items.slice(0, 2).map((item, index) => (
        <div key={`${item.label}-${index}`}>
          {item.icon === "users" ? <Users size={19} /> : <Flame size={19} />}
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function LeadFormBlock({ block, canSubmit, error, form, savedLead, status, submitLead, updateField }) {
  return (
    <>
      <form className="lead-form" onSubmit={submitLead}>
        <label>
          <span>{block.nameLabel} <b>*</b></span>
          <input
            autoComplete="name"
            name="name"
            placeholder={block.namePlaceholder}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>

        <label>
          <span>{block.phoneLabel} <b>*</b></span>
          <input
            autoComplete="tel"
            inputMode="numeric"
            name="phone"
            placeholder={block.phonePlaceholder}
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>

        <label className="consent-row">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(event) => updateField("consent", event.target.checked)}
          />
          <span>
            <strong>{block.consentTitle}</strong>
            <small>{block.consentText}</small>
          </span>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={!canSubmit || status === "submitting"} type="submit">
          {status === "submitting" ? "저장 중..." : block.submitText}
          <ArrowRight size={20} />
        </button>

        <p className="secure-note">
          <LockKeyhole size={14} />
          {block.secureNote}
        </p>
      </form>

      {status === "success" ? <SuccessCard block={block} lead={savedLead} /> : null}
    </>
  );
}

function Metric({ icon, value, label }) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}

function SuccessCard({ block, lead }) {
  const message = block.successText.replace("{name}", lead?.name || "신청자");

  return (
    <div className="success-card" role="status">
      <span className="success-icon">
        <Check size={23} />
      </span>
      <div>
        <strong>{block.successTitle}</strong>
        <p>{message}</p>
        {openChatUrl ? (
          <a href={openChatUrl} target="_blank" rel="noreferrer">
            대기방 바로가기
            <ArrowRight size={16} />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function AdminPage() {
  const [leads, setLeads] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState("");
  const [activeSection, setActiveSection] = useState("leads");

  async function loadLeads() {
    setLoading(true);
    const response = await fetch("/api/leads");
    const payload = await response.json();
    setLeads(payload.leads || []);
    setLoading(false);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.phone, lead.sourcePath, lead.campaign]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [leads, query]);

  const todaysCount = leads.filter((lead) => {
    const created = new Date(lead.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  async function copyValue(id, value) {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(""), 1400);
  }

  const uniqueSources = Array.from(
    leads.reduce((map, lead) => {
      const key = lead.sourcePath || "/";
      const current = map.get(key) || { sourcePath: key, count: 0, latestAt: lead.createdAt };
      current.count += 1;
      if (new Date(lead.createdAt) > new Date(current.latestAt)) current.latestAt = lead.createdAt;
      map.set(key, current);
      return map;
    }, new Map()).values()
  );

  const navItems = [
    { id: "leads", label: "신청자 목록", icon: <Users size={18} /> },
    { id: "links", label: "유입 링크 관리", icon: <LinkIcon size={18} /> },
    { id: "stats", label: "통계 분석", icon: <BarChart3 size={18} /> },
    { id: "settings", label: "페이지 편집", icon: <Settings size={18} /> },
  ];

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Brand />
        <nav aria-label="관리 메뉴">
          {navItems.map((item) => (
            <button
              className={activeSection === item.id ? "active" : ""}
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <h1>광고 DB 관리</h1>
            <p>신청자 데이터를 한눈에 확인하고 관리하세요.</p>
          </div>
          <button className="icon-button" type="button" aria-label="메뉴">
            <Menu size={21} />
          </button>
        </header>

        <div className="admin-stats">
          <Stat icon={<Users size={20} />} label="전체 신청" value={`${leads.length}건`} />
          <Stat icon={<Flame size={20} />} label="오늘 신청" value={`${todaysCount}건`} />
          <Stat icon={<LinkIcon size={20} />} label="유입 링크" value={`${new Set(leads.map((lead) => lead.sourcePath)).size}개`} />
        </div>

        {activeSection === "leads" ? (
          <LeadsPanel
            copiedId={copiedId}
            filteredLeads={filteredLeads}
            loading={loading}
            query={query}
            setQuery={setQuery}
            loadLeads={loadLeads}
            copyValue={copyValue}
          />
        ) : null}

        {activeSection === "links" ? <LinksPanel copiedId={copiedId} copyValue={copyValue} uniqueSources={uniqueSources} /> : null}
        {activeSection === "stats" ? <StatsPanel leads={leads} uniqueSources={uniqueSources} /> : null}
        {activeSection === "settings" ? <SettingsPanel /> : null}
      </section>
    </main>
  );
}

function LeadsPanel({ copiedId, filteredLeads, loading, query, setQuery, loadLeads, copyValue }) {
  return (
    <section className="table-panel">
      <div className="table-toolbar">
        <div>
          <h2>신청자 목록</h2>
          <span>총 {filteredLeads.length}건</span>
        </div>
        <div className="toolbar-actions">
          <label className="search-box">
            <Search size={17} />
            <input
              placeholder="이름, 연락처, 링크 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button className="ghost-button" type="button" onClick={loadLeads}>
            <RefreshCcw size={17} />
            새로고침
          </button>
          <a className="download-button" href="/api/leads.csv">
            <Download size={17} />
            엑셀 다운로드
          </a>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>성함</th>
              <th>연락처</th>
              <th>유입 링크</th>
              <th>신청일시</th>
              <th>복사</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  데이터를 불러오는 중입니다.
                </td>
              </tr>
            ) : filteredLeads.length ? (
              filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{formatPhone(lead.phone)}</td>
                  <td>
                    <a className="source-link" href={lead.sourcePath || "/"} target="_blank" rel="noreferrer">
                      {lead.sourcePath || "/"}
                      <ExternalLink size={14} />
                    </a>
                  </td>
                  <td>{formatDate(lead.createdAt)}</td>
                  <td>
                    <button className="copy-button" type="button" onClick={() => copyValue(lead.id, `${lead.name} ${lead.phone}`)}>
                      <Copy size={15} />
                      {copiedId === lead.id ? "완료" : "복사"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-cell">
                  아직 신청 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredLeads.length > 10 ? (
        <div className="pager" aria-label="페이지">
          <button type="button" className="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">
            <ChevronDown size={15} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function LinksPanel({ copiedId, copyValue, uniqueSources }) {
  const origin = window.location.origin;
  const fallbackLinks = [
    "/ad/temu-0506?source=instagram&campaign=temu-0506",
    "/ad/reels-0506?source=reels&campaign=temu-0506",
    "/ad/story-0506?source=story&campaign=temu-0506",
  ];
  const sourceRows = uniqueSources.length
    ? uniqueSources
    : fallbackLinks.map((sourcePath) => ({ sourcePath, count: 0, latestAt: "" }));

  return (
    <section className="table-panel compact-panel">
      <div className="table-toolbar">
        <div>
          <h2>유입 링크 관리</h2>
          <span>광고별 URL</span>
        </div>
      </div>
      <div className="link-list">
        {sourceRows.map((source) => {
          const fullUrl = `${origin}${source.sourcePath}`;
          return (
            <article className="link-row" key={source.sourcePath}>
              <span>
                <LinkIcon size={18} />
              </span>
              <div>
                <strong>{source.sourcePath}</strong>
                <small>{source.count}건 유입{source.latestAt ? ` · 최근 ${formatDate(source.latestAt)}` : ""}</small>
              </div>
              <button className="copy-button" type="button" onClick={() => copyValue(source.sourcePath, fullUrl)}>
                <Copy size={15} />
                {copiedId === source.sourcePath ? "완료" : "복사"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StatsPanel({ leads, uniqueSources }) {
  const topSource = uniqueSources.toSorted((a, b) => b.count - a.count)[0];
  const latestLead = leads[0];

  return (
    <section className="table-panel compact-panel">
      <div className="table-toolbar">
        <div>
          <h2>통계 분석</h2>
          <span>실시간 요약</span>
        </div>
      </div>
      <div className="insight-grid">
        <Metric icon={<Users size={18} />} value={`${leads.length}건`} label="누적 신청" />
        <Metric icon={<LinkIcon size={18} />} value={topSource?.sourcePath || "-"} label="상위 유입" />
        <Metric icon={<Flame size={18} />} value={latestLead ? formatDate(latestLead.createdAt) : "-"} label="최근 신청" />
      </div>
    </section>
  );
}

function SettingsPanel() {
  const [settings, setSettings] = useState(() => cloneDefaultSettings());
  const [selectedBlockId, setSelectedBlockId] = useState(defaultSiteSettings.blocks[0].id);
  const [saveState, setSaveState] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/site-settings");
        const payload = await response.json();
        if (isMounted && payload.settings) {
          const merged = mergeSiteSettings(payload.settings);
          setSettings(merged);
          setSelectedBlockId(merged.blocks[0]?.id || "");
        }
      } catch {
        if (isMounted) setError("신청 페이지 설정을 불러오지 못했습니다.");
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  function addBlock(type) {
    const block = createBlock(type);
    setSettings((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedBlockId(block.id);
  }

  function removeBlock(blockId) {
    setSettings((current) => {
      const nextBlocks = current.blocks.filter((block) => block.id !== blockId);
      const safeBlocks = nextBlocks.length ? nextBlocks : [createBlock("text")];
      setSelectedBlockId(safeBlocks[0].id);
      return { ...current, blocks: safeBlocks };
    });
  }

  function updateBlock(blockId, updater) {
    setSettings((current) => ({
      ...current,
      blocks: current.blocks.map((block) => {
        if (block.id !== blockId) return block;
        return typeof updater === "function" ? updater(block) : { ...block, ...updater };
      }),
    }));
  }

  function updateStatsItem(blockId, itemIndex, field, value) {
    updateBlock(blockId, (block) => ({
      ...block,
      items: block.items.map((item, index) => (index === itemIndex ? { ...item, [field]: value } : item)),
    }));
  }

  async function updatePhotoFile(blockId, file) {
    if (!file) return;
    if (file.size > 40 * 1024 * 1024) {
      setError("파일은 40MB 이하로 올려주세요.");
      return;
    }

    const imageSrc = await readFileAsDataUrl(file);
    updateBlock(blockId, { imageSrc, mediaSrc: imageSrc });
  }

  async function saveSettings() {
    setSaveState("saving");
    setError("");

    try {
      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "설정을 저장하지 못했습니다.");
      }

      setSettings(mergeSiteSettings(payload.settings));
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1600);
    } catch (requestError) {
      setError(requestError.message);
      setSaveState("idle");
    }
  }

  return (
    <section className="table-panel compact-panel">
      <div className="table-toolbar">
        <div>
          <h2>페이지 편집</h2>
          <span>미리보기에서 직접 수정</span>
        </div>
        <div className="builder-tools" aria-label="페이지 도구">
          <button className="ghost-button" type="button" onClick={() => addBlock("text")}>
            <Type size={17} />
            글 추가
          </button>
          <button className="ghost-button" type="button" onClick={() => addBlock("photo")}>
            <ImagePlus size={17} />
            사진 추가
          </button>
          <button className="ghost-button" type="button" onClick={() => addBlock("video")}>
            <Play size={17} />
            동영상 추가
          </button>
          <button className="ghost-button" type="button" onClick={() => addBlock("form")}>
            <Plus size={17} />
            신청칸
          </button>
        </div>
      </div>

      <div className="page-builder">
        <ThemeEditor settings={settings} setSettings={setSettings} />

        <div className="builder-preview">
          <div className="editor-preview-surface" style={getThemeStyle(settings)}>
            {settings.blocks.map((block) => (
              <EditablePreviewBlock
                block={block}
                isSelected={selectedBlockId === block.id}
                key={block.id}
                onFileChange={(file) => updatePhotoFile(block.id, file)}
                onRemove={() => removeBlock(block.id)}
                onSelect={() => setSelectedBlockId(block.id)}
                onStatsChange={(itemIndex, field, value) => updateStatsItem(block.id, itemIndex, field, value)}
                onUpdate={(patch) => updateBlock(block.id, patch)}
              />
            ))}
          </div>
        </div>

        <div className="settings-list builder-meta">
          <div>
            <strong>오픈채팅 URL</strong>
            <small>{openChatUrl || "VITE_OPEN_CHAT_URL 미설정"}</small>
          </div>
          <div>
            <strong>데이터 저장 위치</strong>
            <small>data/leads.json</small>
          </div>
        </div>
      </div>

      {error ? <p className="form-error builder-error">{error}</p> : null}

      <div className="settings-actions builder-actions">
        <button className="download-button" type="button" onClick={saveSettings} disabled={saveState === "saving"}>
          <Settings size={17} />
          {saveState === "saving" ? "저장 중..." : saveState === "saved" ? "저장 완료" : "신청 페이지 저장"}
        </button>
      </div>
    </section>
  );
}

function ThemeEditor({ settings, setSettings }) {
  function updateTheme(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  return (
    <aside className="theme-editor" aria-label="신청 페이지 디자인">
      <h3>디자인</h3>
      <label>
        <span>배경 색상</span>
        <input type="color" value={settings.pageBackground} onChange={(event) => updateTheme("pageBackground", event.target.value)} />
      </label>
      <label>
        <span>기본 글 색상</span>
        <input type="color" value={settings.pageTextColor} onChange={(event) => updateTheme("pageTextColor", event.target.value)} />
      </label>
      <label>
        <span>버튼 색상</span>
        <input type="color" value={settings.accentColor} onChange={(event) => updateTheme("accentColor", event.target.value)} />
      </label>
      <label>
        <span>글꼴</span>
        <select value={settings.fontFamily} onChange={(event) => updateTheme("fontFamily", event.target.value)}>
          {fontOptions.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>
    </aside>
  );
}

function EditablePreviewBlock({ block, isSelected, onFileChange, onRemove, onSelect, onStatsChange, onUpdate }) {
  return (
    <section className={`preview-edit-block ${isSelected ? "selected" : ""}`} onClick={onSelect}>
      <div className="preview-block-toolbar">
        <span>{blockTypeLabel(block.type)}</span>
        <button type="button" aria-label="블록 삭제" onClick={(event) => { event.stopPropagation(); onRemove(); }}>
          <Trash2 size={15} />
        </button>
      </div>

      {block.type === "photo" ? (
        <div className="preview-photo-editor">
          {block.mediaType === "video" ? (
            <video src={block.mediaSrc || block.imageSrc} controls playsInline preload="metadata" />
          ) : (
            <img src={block.mediaSrc || block.imageSrc || "/images/ad-video-thumbnail.png"} alt="편집 중인 사진" />
          )}
          <label className="preview-select-field">
            <span>미디어 종류</span>
            <select value={block.mediaType || "image"} onChange={(event) => onUpdate({ mediaType: event.target.value })}>
              <option value="image">사진</option>
              <option value="video">동영상</option>
            </select>
          </label>
          <label className="photo-upload-button">
            <ImagePlus size={16} />
            {block.mediaType === "video" ? "동영상 선택" : "사진 선택"}
            <input accept={block.mediaType === "video" ? "video/*" : "image/*"} type="file" onChange={(event) => onFileChange(event.target.files?.[0])} />
          </label>
          <input
            value={block.mediaSrc || block.imageSrc || ""}
            onChange={(event) => onUpdate({ mediaSrc: event.target.value, imageSrc: event.target.value })}
            placeholder="사진/동영상 주소 또는 업로드 파일"
          />
          <input value={block.badge} onChange={(event) => onUpdate({ badge: event.target.value })} placeholder="사진 위 작은 문구" />
          <textarea rows={2} value={block.title} onChange={(event) => onUpdate({ title: event.target.value })} placeholder="사진 위 큰 문구" />
        </div>
      ) : null}

      {block.type === "stats" ? (
        <div className="preview-stats-editor">
          {block.items.map((item, index) => (
            <div className="preview-stat-card" key={`${block.id}-${index}`}>
              {item.icon === "users" ? <Users size={17} /> : <Flame size={17} />}
              <input value={item.label} onChange={(event) => onStatsChange(index, "label", event.target.value)} placeholder="라벨" />
              <input value={item.value} onChange={(event) => onStatsChange(index, "value", event.target.value)} placeholder="값" />
            </div>
          ))}
        </div>
      ) : null}

      {block.type === "form" ? (
        <div className="preview-form-editor">
          <input value={block.nameLabel} onChange={(event) => onUpdate({ nameLabel: event.target.value })} placeholder="이름 라벨" />
          <input value={block.namePlaceholder} onChange={(event) => onUpdate({ namePlaceholder: event.target.value })} placeholder="이름 안내문" />
          <input value={block.phoneLabel} onChange={(event) => onUpdate({ phoneLabel: event.target.value })} placeholder="연락처 라벨" />
          <input value={block.phonePlaceholder} onChange={(event) => onUpdate({ phonePlaceholder: event.target.value })} placeholder="연락처 안내문" />
          <input value={block.consentTitle} onChange={(event) => onUpdate({ consentTitle: event.target.value })} placeholder="동의 제목" />
          <textarea rows={2} value={block.consentText} onChange={(event) => onUpdate({ consentText: event.target.value })} placeholder="동의 문구" />
          <input value={block.submitText} onChange={(event) => onUpdate({ submitText: event.target.value })} placeholder="버튼 문구" />
          <input value={block.secureNote} onChange={(event) => onUpdate({ secureNote: event.target.value })} placeholder="보안 안내" />
        </div>
      ) : null}

      {block.type === "text" ? (
        <div className="preview-text-editor">
          <input value={block.kicker} onChange={(event) => onUpdate({ kicker: event.target.value })} placeholder="작은 제목" />
          <textarea
            className="preview-title-input"
            rows={2}
            style={{
              color: block.titleColor,
              fontFamily: block.fontFamily === "inherit" ? "inherit" : block.fontFamily,
              fontSize: `${Number(block.titleSize) || 31}px`,
            }}
            value={block.title}
            onChange={(event) => onUpdate({ title: event.target.value })}
            placeholder="큰 제목"
          />
          <textarea rows={3} value={block.body} onChange={(event) => onUpdate({ body: event.target.value })} placeholder="설명 문구" />
          <div className="style-grid">
            <label>
              <span>제목 크기</span>
              <input type="number" min="16" max="72" value={block.titleSize || "31"} onChange={(event) => onUpdate({ titleSize: event.target.value })} />
            </label>
            <label>
              <span>제목 색상</span>
              <input type="color" value={block.titleColor || "#ffffff"} onChange={(event) => onUpdate({ titleColor: event.target.value })} />
            </label>
            <label>
              <span>설명 크기</span>
              <input type="number" min="11" max="36" value={block.bodySize || "15"} onChange={(event) => onUpdate({ bodySize: event.target.value })} />
            </label>
            <label>
              <span>설명 색상</span>
              <input type="color" value={block.bodyColor || "#a9adba"} onChange={(event) => onUpdate({ bodyColor: event.target.value })} />
            </label>
            <label className="wide">
              <span>글꼴</span>
              <select value={block.fontFamily || "inherit"} onChange={(event) => onUpdate({ fontFamily: event.target.value })}>
                <option value="inherit">페이지 기본</option>
                {fontOptions.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function blockTypeLabel(type) {
  if (type === "photo") return "사진";
  if (type === "form") return "신청칸";
  if (type === "stats") return "숫자칸";
  return "글";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("사진을 불러오지 못했습니다.")));
    reader.readAsDataURL(file);
  });
}

function EditableField({ helper, label, onChange, rows = 1, value }) {
  return (
    <label className="editable-field">
      <span>{label}</span>
      {rows > 1 ? (
        <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function Stat({ icon, label, value }) {
  return (
    <article className="stat-card">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function formatPhone(phone) {
  const digits = String(phone || "").replace(/[^\d]/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return digits;
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

createRoot(document.getElementById("root")).render(<App />);

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
  Phone,
  Play,
  RefreshCcw,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import "./styles.css";

const openChatUrl = import.meta.env.VITE_OPEN_CHAT_URL || "";

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
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [savedLead, setSavedLead] = useState(null);

  const params = new URLSearchParams(window.location.search);
  const campaign = params.get("campaign") || params.get("utm_campaign") || "";
  const sourcePath = `${window.location.pathname}${window.location.search}`;
  const phoneDigits = form.phone.replace(/[^\d]/g, "");
  const canSubmit = form.name.trim().length >= 2 && /^01\d{8,9}$/.test(phoneDigits) && form.consent;

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
    <main className="lead-page">
      <section className="lead-stage" aria-label="광고 DB 신청 페이지">
        <div className="phone-frame">
          <div className="phone-top">
            <span>9:41</span>
            <div className="phone-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="lead-content">
            <Brand />

            <div className="lead-heading">
              <p>라이브 시작 전 선착순 초대</p>
              <h1>테무 위탁 판매 프로젝트</h1>
            </div>

            <VideoPanel />

            <div className="live-row" aria-label="라이브 현황">
              <div>
                <Flame size={19} />
                <span>라이브 시작까지</span>
                <strong>01일 13시 48분</strong>
              </div>
              <div>
                <Users size={19} />
                <span>현재 대기 인원</span>
                <strong>278명</strong>
              </div>
            </div>

            <form className="lead-form" onSubmit={submitLead}>
              <label>
                <span>성함 <b>*</b></span>
                <input
                  autoComplete="name"
                  name="name"
                  placeholder="예시) 홍길동"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                />
              </label>

              <label>
                <span>연락처 <b>*</b></span>
                <input
                  autoComplete="tel"
                  inputMode="numeric"
                  name="phone"
                  placeholder="예시) 01012345678 (- 제외)"
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
                  <strong>정보제공동의</strong>
                  <small>신청 시, 개인정보 수집 및 이용에 동의한 것으로 간주됩니다.</small>
                </span>
              </label>

              {error ? <p className="form-error">{error}</p> : null}

              <button className="primary-button" disabled={!canSubmit || status === "submitting"} type="submit">
                {status === "submitting" ? "저장 중..." : "오픈채팅 대기방 접속"}
                <ArrowRight size={20} />
              </button>

              <p className="secure-note">
                <LockKeyhole size={14} />
                입력한 정보는 안전하게 저장됩니다.
              </p>
            </form>

            {status === "success" ? (
              <SuccessCard lead={savedLead} />
            ) : (
              <div className="source-card">
                <LinkIcon size={16} />
                <span>{sourcePath}</span>
              </div>
            )}
          </div>
        </div>

        <aside className="lead-side-panel" aria-label="광고 운영 요약">
          <Brand />
          <h2>광고 링크만 바꿔도 유입 경로가 자동으로 남습니다.</h2>
          <p>영상 설명, 스토리, 릴스 CTA에 이 주소를 연결하면 신청 데이터가 관리자 화면으로 모입니다.</p>
          <div className="side-grid">
            <Metric icon={<User size={18} />} value="성함" label="필수 입력" />
            <Metric icon={<Phone size={18} />} value="연락처" label="숫자만 저장" />
            <Metric icon={<ShieldCheck size={18} />} value="동의" label="체크 상태 기록" />
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

function VideoPanel() {
  return (
    <article className="video-panel">
      <img src="/images/ad-video-thumbnail.png" alt="광고 영상 썸네일" />
      <div className="video-shade" />
      <button className="play-button" type="button" aria-label="영상 재생">
        <Play size={28} fill="currentColor" />
      </button>
      <div className="video-copy">
        <span>실전 노하우 공개</span>
        <strong>누구나 따라하는 위탁 판매 루틴</strong>
      </div>
    </article>
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

function SuccessCard({ lead }) {
  return (
    <div className="success-card" role="status">
      <span className="success-icon">
        <Check size={23} />
      </span>
      <div>
        <strong>신청이 완료되었습니다.</strong>
        <p>{lead?.name || "신청자"}님, 오픈채팅 초대 정보를 전송해드릴게요.</p>
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
    { id: "settings", label: "설정", icon: <Settings size={18} /> },
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
  return (
    <section className="table-panel compact-panel">
      <div className="table-toolbar">
        <div>
          <h2>설정</h2>
          <span>연동 상태</span>
        </div>
      </div>
      <div className="settings-list">
        <div>
          <strong>오픈채팅 URL</strong>
          <small>{openChatUrl || "VITE_OPEN_CHAT_URL 미설정"}</small>
        </div>
        <div>
          <strong>데이터 저장 위치</strong>
          <small>data/leads.json</small>
        </div>
      </div>
    </section>
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

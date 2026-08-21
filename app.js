const fallbackIssues = [
  { tag: "제도·규제", title: "실손보험 구조 개편 논의, 비급여 관리가 핵심 변수", summary: "금융당국과 업계가 보험료 부담과 과잉진료 문제를 함께 낮추는 방향을 검토하고 있습니다. 가입자별 보험료와 보장 범위에 변화가 생길 수 있어 관련 발표를 지켜볼 필요가 있습니다.", source: "관련 기사 보기", url: "https://news.google.com/search?q=%EC%8B%A4%EC%86%90%EB%B3%B4%ED%97%98&hl=ko&gl=KR&ceid=KR%3Ako" },
  { tag: "상품·서비스", title: "건강관리 연동 보험, ‘예방’ 혜택 경쟁이 커진다", summary: "운동·건강검진 등 건강 데이터를 활용해 보험료 혜택을 제공하는 상품이 늘고 있습니다. 단순 보장 중심에서 사전 예방 서비스까지 보험사의 경쟁 범위가 넓어지는 흐름입니다.", source: "관련 기사 보기", url: "https://news.google.com/search?q=%EA%B1%B4%EA%B0%95%EA%B4%80%EB%A6%AC+%EB%B3%B4%ED%97%98&hl=ko&gl=KR&ceid=KR%3Ako" },
  { tag: "보험사", title: "보험사, 장기 보장성 상품 중심의 수익성 관리 강화", summary: "금리와 손해율 변동성이 이어지면서 보험사들은 보장성 상품의 포트폴리오와 계약 유지율 관리에 더 집중하고 있습니다. 실적 발표에서는 신계약 가치와 손해율을 함께 확인하는 것이 좋습니다.", source: "관련 기사 보기", url: "https://news.google.com/search?q=%EB%B3%B4%ED%97%98%EC%82%AC+%EC%88%98%EC%9D%B5%EC%84%B1&hl=ko&gl=KR&ceid=KR%3Ako" },
  { tag: "제도·규제", title: "GA 판매채널 관리 강화, 소비자 보호 기준 주목", summary: "법인보험대리점의 불완전판매 예방과 내부통제에 대한 관심이 높아지고 있습니다. 판매 과정의 설명 의무와 사후 관리 체계가 영업 현장의 주요 과제가 될 전망입니다.", source: "관련 기사 보기", url: "https://news.google.com/search?q=GA+%EB%B3%B4%ED%97%98+%EC%86%8C%EB%B9%84%EC%9E%90+%EB%B3%B4%ED%98%B8&hl=ko&gl=KR&ceid=KR%3Ako" },
  { tag: "상품·서비스", title: "반려동물 보험, 보장 범위와 진료비 표준화가 관건", summary: "펫보험 가입 관심은 높아졌지만 진료 항목과 비용 기준의 불확실성이 성장 속도를 좌우합니다. 병원 진료 체계와 연계한 서비스 개선 여부가 다음 관전 포인트입니다.", source: "관련 기사 보기", url: "https://news.google.com/search?q=%ED%8E%AB%EB%B3%B4%ED%97%98&hl=ko&gl=KR&ceid=KR%3Ako" }
];

const archives = [
  ["2026.08.20", "보험료·손해율, 하반기 실적의 두 변수", "핵심 이슈 5건"],
  ["2026.08.19", "AI 보험심사 도입, 어디까지 왔나", "핵심 이슈 4건"],
  ["2026.08.18", "고령화 시대의 간병보험 경쟁", "핵심 이슈 6건"]
];

function koreanDate() {
  return new Intl.DateTimeFormat("ko-KR", { year:"numeric", month:"long", day:"numeric", weekday:"short" })
    .format(new Date()).replace(/\s([일월화수목금토])$/, " ($1)");
}
let issues = fallbackIssues;
const escapeHtml = value => String(value || "").replace(/[&<>'"]/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#039;", '"':"&quot;" })[character]);
const safeUrl = value => /^https:\/\//.test(value || "") ? value : "#";
function renderIssues(filter = "all") {
  const visible = filter === "all" ? issues : issues.filter(item => item.tag === filter);
  document.querySelector("#news-list").innerHTML = visible.map((item, index) => `
    <article class="news-card">
      <span class="rank">${String(index + 1).padStart(2, "0")}</span>
      <div><span class="tag">${escapeHtml(item.tag)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p></div>
      <a class="article-link" href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source)} ↗</a>
    </article>`).join("");
}
function renderArchive() {
  document.querySelector("#archive-list").innerHTML = archives.map(([date, title, count]) => `
    <a class="archive-card" href="#today"><time>${date}</time><strong>${title}</strong><span>${count} · 다시 보기 →</span></a>`).join("");
}
function renderKeywords(keywords) {
  if (!Array.isArray(keywords) || keywords.length < 1) return;
  document.querySelector("#keyword-list").innerHTML = keywords.slice(0, 5)
    .map(keyword => `<span>${escapeHtml(keyword)}</span>`).join("");
}
function renderMarketContext(items) {
  if (!Array.isArray(items) || !items.length) return;
  document.querySelector("#market-list").innerHTML = items.slice(0, 3).map(item => `
    <article class="market-item">
      <span>${escapeHtml(item.label)}</span>
      <p>${escapeHtml(item.summary)}</p>
      <a href="${safeUrl(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source || "관련 뉴스")} ↗</a>
    </article>`).join("");
}
document.querySelector("#current-date").textContent = koreanDate();
renderIssues(); renderArchive();
fetch("data/brief.json")
  .then(response => response.ok ? response.json() : Promise.reject())
  .then(brief => {
    if (!Array.isArray(brief.issues) || !brief.issues.length) return;
    issues = brief.issues;
    document.querySelector("blockquote").textContent = `“${brief.editorNote || ""}”`;
    renderKeywords(brief.keywords);
    renderMarketContext(brief.marketContext);
    const time = new Date(brief.updatedAt);
    if (!Number.isNaN(time.getTime())) document.querySelector(".updated b").textContent = time.toLocaleTimeString("ko-KR", { hour:"2-digit", minute:"2-digit", hour12:false });
    renderIssues(document.querySelector(".filter.selected").dataset.filter);
  })
  .catch(() => {});
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(item => item.classList.remove("selected"));
  button.classList.add("selected"); renderIssues(button.dataset.filter);
}));
document.querySelector("#theme-toggle").addEventListener("click", () => document.body.classList.toggle("dark"));
document.querySelector("#show-archive").addEventListener("click", () => alert("아카이브는 브리핑이 쌓이면 날짜별 전체 목록으로 확장됩니다."));

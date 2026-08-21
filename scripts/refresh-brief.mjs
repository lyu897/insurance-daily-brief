import { writeFile } from "node:fs/promises";

const HOURS = 24;
const rssUrls = [
  "https://news.google.com/rss/search?q=%EB%B3%B4%ED%97%98+OR+%EC%8B%A4%EC%86%90%EB%B3%B4%ED%97%98+OR+%ED%8E%AB%EB%B3%B4%ED%97%98+OR+%EC%83%9D%EB%AA%85%EB%B3%B4%ED%97%98&hl=ko&gl=KR&ceid=KR:ko",
  "https://news.google.com/rss/search?q=%EB%AF%B8%EA%B5%AD+%EA%B8%B0%EC%A4%80%EA%B8%88%EB%A6%AC+OR+%EA%B5%AD%EC%B1%84%EA%B8%88%EB%A6%AC+OR+%EC%9B%90%EB%8B%AC%EB%9F%AC+%ED%99%98%EC%9C%A8+OR+%EB%B6%80%EB%8F%99%EC%82%B0+PF&hl=ko&gl=KR&ceid=KR:ko"
];
const decode = (value = "") => value.replace(/<!\[CDATA\[([\s\S]*?)]]>/g, "$1").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
const element = (xml, name) => decode(xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`))?.[1]);

async function getRecentArticles() {
  const xmls = await Promise.all(rssUrls.map(async url => (await fetch(url)).text()));
  const cutoff = Date.now() - HOURS * 60 * 60 * 1000;
  const articles = xmls.flatMap(xml => [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]).map(match => {
    const item = match[1];
    return { title: element(item, "title"), url: element(item, "link"), source: element(item, "source"), publishedAt: element(item, "pubDate") };
  }).filter(article => article.title && new Date(article.publishedAt).getTime() >= cutoff);
  return [...new Map(articles.map(article => [article.title, article])).values()].slice(0, 45);
}

async function summarize(articles) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  const prompt = `당신은 한국 보험산업 전문 에디터입니다. 아래 최근 24시간의 기사 메타데이터를 바탕으로 중복 기사를 하나의 이슈로 묶고, 가장 중요한 보험 이슈 최대 5개와 오늘의 핵심 키워드 3~5개를 골라 주세요. 또한 보험사 자산운용·상품가격·건전성에 영향을 주는 금융시장 변수(미국 금리, 국내외 채권금리, 환율, 부동산 등)를 2~3개 골라 보험시장과의 연결점을 설명하세요. 기사 본문에 없는 사실은 절대 추가하지 마세요. 요약은 핵심 내용과 의미를 합쳐 2문장으로 작성하세요.\n\n기사 목록:\n${JSON.stringify(articles)}`;
  const schema = { type: "object", additionalProperties: false, required: ["editorNote", "keywords", "marketContext", "issues"], properties: { editorNote: { type: "string" }, keywords: { type: "array", minItems: 3, maxItems: 5, items: { type: "string" } }, marketContext: { type: "array", minItems: 2, maxItems: 3, items: { type: "object", additionalProperties: false, required: ["label", "summary", "url", "source"], properties: { label: { type: "string" }, summary: { type: "string" }, url: { type: "string" }, source: { type: "string" } } } }, issues: { type: "array", maxItems: 5, items: { type: "object", additionalProperties: false, required: ["tag", "title", "summary", "url", "source"], properties: { tag: { type: "string" }, title: { type: "string" }, summary: { type: "string" }, url: { type: "string" }, source: { type: "string" } } } } } };
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-5.6-luna", input: prompt, text: { format: { type: "json_schema", name: "daily_insurance_brief", strict: true, schema } } }) });
  if (!response.ok) throw new Error(`요약 요청 실패: ${response.status}`);
  const payload = await response.json();
  const text = payload.output_text || payload.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
  return JSON.parse(text);
}

const articles = await getRecentArticles();
if (!articles.length) throw new Error("최근 24시간의 기사를 찾지 못했습니다.");
const brief = await summarize(articles);
await writeFile("data/brief.json", JSON.stringify({ updatedAt: new Date().toISOString(), articleCount: articles.length, ...brief }, null, 2));
console.log(`${brief.issues.length}개 핵심 이슈를 저장했습니다.`);

const Parser = require('rss-parser');
const fetch = require('node-fetch');

const RSS_URL = "https://news.google.com/rss/search?q=%EB%A0%89%EC%84%9C%EC%8A%A4+site:naver.com&hl=ko&gl=KR&ceid=KR:ko";
const WEBHOOK_URL = process.env.JANDI_WEBHOOK_URL;

// Google News RSS의 guid(item.id)에서 네이버 뉴스 원본 링크 추출
function extractNaverUrlFromGuid(guid) {
  const match = guid.match(/https?:\/\/(?:n|m)\.news\.naver\.com\/[^ \n"]+/);
  return match ? match[0] : null;
}

async function main() {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);

  // Google News RSS → guid에서 원본 네이버 뉴스만 추출
  const naverNewsOnly = feed.items
    .map(item => {
      const original = extractNaverUrlFromGuid(item.id || "");
      return {
        title: item.title,
        link: original
      };
    })
    .filter(item => item.link)   // null 제거
    .slice(0, 5);

  const items = naverNewsOnly
    .map(i => `• [${i.title}](${i.link})`)
    .join("\n");

  const payload = {
    body: `오늘의 뉴스 레터`,
    connectColor: "#00AACC",
    connectInfo: [{ title: "렉서스 뉴스", description: items }]
  };

  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("전송 완료!");
}

main();

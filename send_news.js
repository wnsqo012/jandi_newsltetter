const Parser = require('rss-parser');
const fetch = require('node-fetch');

const RSS_URL = "https://news.google.com/rss/search?q=%EB%A0%89%EC%84%9C%EC%8A%A4+site:naver.com&hl=ko&gl=KR&ceid=KR:ko";
const WEBHOOK_URL = process.env.JANDI_WEBHOOK_URL;

function extractOriginalUrl(googleUrl) {
  try {
    const urlObj = new URL(googleUrl);
    const originalUrl = urlObj.searchParams.get("url");
    return originalUrl || googleUrl;
  } catch (e) {
    return googleUrl;
  }
}

async function main() {
  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);

  const naverNewsOnly = feed.items
    .map(item => {
      return {
        title: item.title,
        link: extractOriginalUrl(item.link)
      };
    })
    .filter(item => item.link.includes("news.naver.com"))
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

const Parser = require('rss-parser');
const fetch = require('node-fetch');

const RSS_URL = "https://news.google.com/rss/search?q=%EB%A0%89%EC%84%9C%EC%8A%A4+site:naver.com&hl=ko&gl=KR&ceid=KR:ko";
const WEBHOOK_URL = process.env.JANDI_WEBHOOK_URL;

async function main() {
  if (!WEBHOOK_URL) {
    console.error("❌ ERROR: JANDI_WEBHOOK_URL 환경변수가 없습니다.");
    process.exit(1);
  }

  // 날짜 생성
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateLabel = `${month}/${day}`;  // 또는 `${month}월 ${day}일`

  const parser = new Parser();
  const feed = await parser.parseURL(RSS_URL);

  const items = feed.items
    .filter(item => item.link.includes("news.naver.com"))
    .slice(0, 5)
    .map(i => `• [${i.title}](${i.link})`)
    .join("\n");

  const payload = {
    body: `오늘의 뉴스 레터`,
    connectColor: "#00AACC",
    connectInfo: [
      {
        title: `렉서스 뉴스 (${dateLabel})`,
        description: items
      }
    ]
  };

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  console.log("전송 상태:", res.status);
}

main()
  .catch(err => console.error("오류 발생:", err));

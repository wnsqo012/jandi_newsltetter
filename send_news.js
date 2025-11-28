const fetch = require("node-fetch");

const KEYWORD = "렉서스"; // ← 키워드 바꾸고 싶으면 여기만 수정
const WEBHOOK_URL = process.env.JANDI_WEBHOOK_URL;
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

async function main() {
  // 환경변수 체크
  if (!WEBHOOK_URL) {
    console.error("❌ 환경변수 JANDI_WEBHOOK_URL이 없습니다.");
    process.exit(1);
  }
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.error("❌ NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 없습니다.");
    process.exit(1);
  }

  // 오늘 날짜 라벨 생성
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateLabel = `${month}/${day}`; // 예: 11/28

  // 네이버 뉴스 검색 API URL
  const apiUrl =
    "https://openapi.naver.com/v1/search/news.json?query=" +
    encodeURIComponent(KEYWORD) +
    "&display=5&sort=date";

  // 네이버 뉴스 API 호출
  const newsRes = await fetch(apiUrl, {
    headers: {
      "X-Naver-Client-Id": NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    },
  });

  if (!newsRes.ok) {
    console.error("❌ 네이버 뉴스 API 호출 실패:", newsRes.status, await newsRes.text());
    process.exit(1);
  }

  const data = await newsRes.json();
  const items = data.items || [];

  // 뉴스가 없을 경우 안내 메시지
  let newsText = "";
  if (items.length === 0) {
    newsText = "오늘은 관련된 네이버 뉴스가 없습니다.";
  } else {
    newsText = items
      .map((it) => {
        const title = it.title.replace(/<[^>]+>/g, ""); // HTML 태그 제거
        const link = it.link;
        return `• [${title}](${link})`;
      })
      .join("\n");
  }

  // 잔디 메시지 Payload
  const payload = {
    body: `오늘의 뉴스 레터`,
    connectColor: "#00AACC",
    connectInfo: [
      {
        title: `${KEYWORD} 네이버 뉴스 (${dateLabel})`,
        description: newsText,
      },
    ],
  };

  // 잔디 Webhook 발송
  const jandiRes = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  console.log("📨 잔디 응답 코드:", jandiRes.status);
  console.log("작업 완료!");
}

main().catch((err) => {
  console.error("❌ 스크립트 오류:", err);
  process.exit(1);
});

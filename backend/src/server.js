require("dotenv").config();
const { createApp } = require("./app");

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`저녁 메뉴 추천 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

const express = require("express");
const cors = require("cors");
const recommendRouter = require("./routes/recommend");

function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(
    cors({
      origin: corsOrigin === "*" ? "*" : corsOrigin.split(",").map((o) => o.trim()),
    })
  );

  app.use(express.json());

  // 헬스체크
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // 저녁 메뉴 추천 API
  app.use("/api/recommend", recommendRouter);

  // 존재하지 않는 라우트
  app.use((req, res) => {
    res.status(404).json({ success: false, errors: ["요청하신 경로를 찾을 수 없습니다."] });
  });

  // 전역 에러 핸들러
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error("[ERROR]", err);
    res.status(500).json({
      success: false,
      errors: [err.message || "서버 내부 오류가 발생했습니다."],
    });
  });

  return app;
}

module.exports = { createApp };

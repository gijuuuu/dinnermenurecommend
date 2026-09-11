const express = require("express");
const { validateRecommendInput } = require("../utils/validateRecommendInput");

const router = express.Router();

/**
 * RECOMMEND_MODE 환경변수에 따라 mock 서비스 또는 실제 OpenAI 서비스를 선택한다.
 * - "mock" (기본값): 고정된 메뉴 중에서 랜덤 추천 (OpenAI 결제/호출 없음)
 * - "openai": 실제 OpenAI API를 호출해서 추천
 *
 * openaiService는 "openai" 패키지를 필요로 하므로, mock 모드에서는
 * 아예 불러오지 않도록 필요한 시점에만 require 한다.
 */
function getRecommendMode() {
  return (process.env.RECOMMEND_MODE || "mock").toLowerCase();
}

function getRecommendationService(mode) {
  if (mode === "openai") {
    // eslint-disable-next-line global-require
    return require("../services/openaiService");
  }
  // eslint-disable-next-line global-require
  return require("../services/mockRecommendService");
}

// POST /api/recommend
router.post("/", async (req, res, next) => {
  const validation = validateRecommendInput(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors,
    });
  }

  try {
    const mode = getRecommendMode();
    const { getDinnerRecommendations } = getRecommendationService(mode);
    const recommendations = await getDinnerRecommendations(validation.data);

    return res.status(200).json({
      success: true,
      mode,
      input: validation.data,
      recommendations,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

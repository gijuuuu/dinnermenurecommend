const OpenAI = require("openai");
const { buildSystemPrompt, buildUserPrompt } = require("../utils/promptBuilder");

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다. .env 파일을 확인해주세요.");
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * OpenAI에 저녁 메뉴 추천을 요청하고 파싱된 결과를 반환한다.
 * @param {object} input - weather, mood, peopleCount, dislikedFoods, recentFoods, foodCount
 * @returns {Promise<Array<{menu: string, reason: string, category: string}>>}
 */
async function getDinnerRecommendations(input) {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(input) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const raw = completion.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI 응답이 비어 있습니다.");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`OpenAI 응답을 JSON으로 파싱하지 못했습니다: ${err.message}`);
  }

  const recommendations = parsed.recommendations;
  if (!Array.isArray(recommendations)) {
    throw new Error("OpenAI 응답에 recommendations 배열이 없습니다.");
  }

  return recommendations
    .filter((item) => item && typeof item.menu === "string" && item.menu.trim().length > 0)
    .slice(0, input.foodCount)
    .map((item) => ({
      menu: item.menu.trim(),
      reason: typeof item.reason === "string" ? item.reason.trim() : "",
      category: typeof item.category === "string" ? item.category.trim() : "기타",
    }));
}

module.exports = { getDinnerRecommendations };

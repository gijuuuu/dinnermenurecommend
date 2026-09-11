/**
 * 테스트/개발용 mock 서비스.
 * OpenAI 등 실제 AI API를 호출하지 않고, 고정된 10개 메뉴 중에서
 * foodCount개를 무작위로 뽑아서 반환한다. (입력값은 무시함)
 *
 * 나중에 실제 AI 연동으로 되돌리려면 .env의 RECOMMEND_MODE=openai 로 바꾸면 됨.
 * (src/routes/recommend.js 참고)
 */

const FIXED_MENUS = [
  { menu: "김치찌개", reason: "테스트용 고정 메뉴입니다.", category: "한식" },
  { menu: "된장찌개", reason: "테스트용 고정 메뉴입니다.", category: "한식" },
  { menu: "제육볶음", reason: "테스트용 고정 메뉴입니다.", category: "한식" },
  { menu: "부대찌개", reason: "테스트용 고정 메뉴입니다.", category: "한식" },
  { menu: "짜장면", reason: "테스트용 고정 메뉴입니다.", category: "중식" },
  { menu: "마라탕", reason: "테스트용 고정 메뉴입니다.", category: "중식" },
  { menu: "초밥", reason: "테스트용 고정 메뉴입니다.", category: "일식" },
  { menu: "돈카츠", reason: "테스트용 고정 메뉴입니다.", category: "일식" },
  { menu: "파스타", reason: "테스트용 고정 메뉴입니다.", category: "양식" },
  { menu: "떡볶이", reason: "테스트용 고정 메뉴입니다.", category: "분식" },
];

/**
 * 배열을 무작위로 섞는다 (Fisher–Yates shuffle).
 */
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * openaiService.getDinnerRecommendations 와 동일한 시그니처/반환 형태를 갖는 mock 함수.
 * 입력값(weather, mood, peopleCount, dislikedFoods, recentFoods)은 사용하지 않고
 * foodCount개만 참고해서 FIXED_MENUS 중 무작위로 뽑아 반환한다.
 *
 * @param {object} input - foodCount만 사용됨
 * @returns {Promise<Array<{menu: string, reason: string, category: string}>>}
 */
async function getDinnerRecommendations(input) {
  const foodCount = Math.min(input.foodCount, FIXED_MENUS.length);
  return shuffle(FIXED_MENUS).slice(0, foodCount);
}

module.exports = { getDinnerRecommendations, FIXED_MENUS };

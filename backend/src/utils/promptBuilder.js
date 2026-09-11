/**
 * 저녁 메뉴 추천을 위한 OpenAI 프롬프트를 만드는 유틸.
 *
 * 입력 변수 (프론트엔드에서 수합된 값):
 *  - weather: string        예) "비 옴"
 *  - mood: string           예) "피곤함"
 *  - peopleCount: number    예) 3
 *  - dislikedFoods: string[]  사용자가 직접 입력 (예: ["오이", "갑각류"])
 *  - recentFoods: string[]    사용자가 직접 입력 (예: ["제육볶음", "김치찌개"])
 *  - foodCount: number       추천받고 싶은 메뉴 개수
 */

function buildSystemPrompt() {
  return [
    "너는 한국어로 저녁 메뉴를 추천해주는 음식 큐레이터야.",
    "사용자가 알려준 날씨, 기분, 인원수, 못 먹는 음식, 최근에 먹은 음식을 참고해서",
    "오늘 저녁에 어울리는 메뉴를 추천해줘.",
    "",
    "규칙:",
    "1. dislikedFoods에 있는 음식이나 그 음식이 들어간 요리는 절대 추천하지 마.",
    "2. recentFoods에 있는 음식은 최근에 먹었으니 가능하면 겹치지 않게 추천해.",
    "3. weather와 mood, peopleCount를 반영해서 추천 이유를 자연스럽게 작성해.",
    "4. 반드시 요청받은 개수(foodCount)만큼 서로 다른 메뉴를 추천해.",
    '5. 응답은 반드시 아래 JSON 스키마를 따르는 JSON "객체"로만 출력해. 다른 설명은 절대 붙이지 마.',
    "",
    "JSON 스키마:",
    "{",
    '  "recommendations": [',
    "    {",
    '      "menu": "메뉴 이름",',
    '      "reason": "이 메뉴를 추천하는 이유 (한두 문장, 날씨/기분/인원수 반영)",',
    '      "category": "한식 | 중식 | 일식 | 양식 | 분식 | 기타 중 하나"',
    "    }",
    "  ]",
    "}",
  ].join("\n");
}

function buildUserPrompt({ weather, mood, peopleCount, dislikedFoods, recentFoods, foodCount }) {
  const disliked = dislikedFoods && dislikedFoods.length > 0 ? dislikedFoods.join(", ") : "없음";
  const recent = recentFoods && recentFoods.length > 0 ? recentFoods.join(", ") : "없음";

  return [
    "다음 조건에 맞는 저녁 메뉴를 추천해줘.",
    "",
    `- 오늘 날씨: ${weather}`,
    `- 오늘 기분: ${mood}`,
    `- 같이 먹을 인원 수: ${peopleCount}명`,
    `- 못 먹는 음식(절대 추천 금지): ${disliked}`,
    `- 최근에 먹은 음식(가능하면 피하기): ${recent}`,
    `- 추천받고 싶은 메뉴 개수: ${foodCount}개`,
  ].join("\n");
}

module.exports = { buildSystemPrompt, buildUserPrompt };

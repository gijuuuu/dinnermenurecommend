const MAX_FOOD_COUNT = 10;
const MAX_LIST_LENGTH = 20;
const MAX_PEOPLE_COUNT = 20;

/**
 * /api/recommend 요청 바디를 검증하고, 정제된 값을 반환한다.
 * 문제가 있으면 { valid: false, errors: string[] } 를,
 * 문제가 없으면 { valid: true, data: {...} } 를 반환한다.
 */
function validateRecommendInput(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["요청 바디가 올바른 JSON 객체가 아닙니다."] };
  }

  const { weather, mood, peopleCount, dislikedFoods, recentFoods, foodCount } = body;

  if (typeof weather !== "string" || weather.trim().length === 0) {
    errors.push("weather는 비어있지 않은 문자열이어야 합니다.");
  }

  if (typeof mood !== "string" || mood.trim().length === 0) {
    errors.push("mood는 비어있지 않은 문자열이어야 합니다.");
  }

  if (
    typeof peopleCount !== "number" ||
    !Number.isInteger(peopleCount) ||
    peopleCount < 1 ||
    peopleCount > MAX_PEOPLE_COUNT
  ) {
    errors.push(`peopleCount는 1 이상 ${MAX_PEOPLE_COUNT} 이하의 정수여야 합니다.`);
  }

  if (
    typeof foodCount !== "number" ||
    !Number.isInteger(foodCount) ||
    foodCount < 1 ||
    foodCount > MAX_FOOD_COUNT
  ) {
    errors.push(`foodCount는 1 이상 ${MAX_FOOD_COUNT} 이하의 정수여야 합니다.`);
  }

  const normalizedDisliked = normalizeStringArray(dislikedFoods, "dislikedFoods", errors);
  const normalizedRecent = normalizeStringArray(recentFoods, "recentFoods", errors);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      weather: weather.trim(),
      mood: mood.trim(),
      peopleCount,
      dislikedFoods: normalizedDisliked,
      recentFoods: normalizedRecent,
      foodCount,
    },
  };
}

function normalizeStringArray(value, fieldName, errors) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    errors.push(`${fieldName}는 문자열 배열이어야 합니다.`);
    return [];
  }
  if (value.length > MAX_LIST_LENGTH) {
    errors.push(`${fieldName}는 최대 ${MAX_LIST_LENGTH}개까지만 입력할 수 있습니다.`);
  }
  const allStrings = value.every((v) => typeof v === "string");
  if (!allStrings) {
    errors.push(`${fieldName}의 각 항목은 문자열이어야 합니다.`);
    return [];
  }
  return value.map((v) => v.trim()).filter((v) => v.length > 0);
}

module.exports = { validateRecommendInput, MAX_FOOD_COUNT, MAX_LIST_LENGTH, MAX_PEOPLE_COUNT };

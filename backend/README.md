# 저녁 메뉴 추천 백엔드

날씨, 기분, 인원수, 못 먹는 음식, 최근에 먹은 음식을 받아서 저녁 메뉴를 추천해주는 Express 백엔드입니다.

> **현재 기본 모드는 `mock`입니다.** OpenAI 결제 전 테스트용으로, 입력값과 상관없이
> 고정된 메뉴 10개 중 `foodCount`개를 무작위로 뽑아 반환합니다. OpenAI 실제 연동을
> 켜려면 `.env`에서 `RECOMMEND_MODE=openai`로 바꾸고 `OPENAI_API_KEY`를 채워주세요.

## 1. 설치

```bash
npm install
```

## 2. 환경변수 설정

`.env.example`을 복사해서 `.env`를 만들고 값을 채워주세요.

```bash
cp .env.example .env
```

| 변수 | 설명 | 기본값 |
|---|---|---|
| `RECOMMEND_MODE` | `mock`(고정 메뉴 랜덤 추천) 또는 `openai`(실제 API 호출) | `mock` |
| `OPENAI_API_KEY` | OpenAI API 키 (`RECOMMEND_MODE=openai`일 때만 필요) | - |
| `OPENAI_MODEL` | 사용할 모델 (`RECOMMEND_MODE=openai`일 때만 사용) | `gpt-4o-mini` |
| `PORT` | 서버 포트 | `3000` |
| `CORS_ORIGIN` | 허용할 프론트엔드 origin (콤마로 여러 개 가능) | `*` |

> `mock` 모드에서는 `openai` 패키지를 아예 불러오지 않으므로, `npm install`만 해두면
> `OPENAI_API_KEY` 없이도 바로 실행/테스트할 수 있습니다.

## 3. 실행

```bash
npm start
```

개발 중 파일 변경 감지가 필요하면:

```bash
npm run dev
```

## 4. API 명세

### POST /api/recommend

저녁 메뉴를 추천받습니다.

**요청 바디 (JSON)**

```json
{
  "weather": "비 옴",
  "mood": "피곤함",
  "peopleCount": 3,
  "dislikedFoods": ["오이", "갑각류"],
  "recentFoods": ["제육볶음", "김치찌개"],
  "foodCount": 5
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `weather` | string | O | 오늘 날씨 |
| `mood` | string | O | 오늘 기분 |
| `peopleCount` | number (정수, 1~20) | O | 같이 먹을 인원 수 |
| `dislikedFoods` | string[] | X (기본 `[]`) | 못 먹는 음식 (최대 20개) |
| `recentFoods` | string[] | X (기본 `[]`) | 최근에 먹은 음식 (최대 20개) |
| `foodCount` | number (정수, 1~10) | O | 추천받을 메뉴 개수 |

> `mock` 모드에서는 `weather`/`mood`/`dislikedFoods`/`recentFoods`가 검증만 되고
> 추천 결과에는 반영되지 않습니다 (고정 메뉴 10개 중 랜덤 추출).

**성공 응답 (200, mock 모드 예시)**

```json
{
  "success": true,
  "mode": "mock",
  "input": {
    "weather": "비 옴",
    "mood": "피곤함",
    "peopleCount": 3,
    "dislikedFoods": ["오이", "갑각류"],
    "recentFoods": ["제육볶음", "김치찌개"],
    "foodCount": 5
  },
  "recommendations": [
    { "menu": "돈카츠", "reason": "테스트용 고정 메뉴입니다.", "category": "일식" },
    { "menu": "떡볶이", "reason": "테스트용 고정 메뉴입니다.", "category": "분식" },
    { "menu": "짜장면", "reason": "테스트용 고정 메뉴입니다.", "category": "중식" },
    { "menu": "김치찌개", "reason": "테스트용 고정 메뉴입니다.", "category": "한식" },
    { "menu": "파스타", "reason": "테스트용 고정 메뉴입니다.", "category": "양식" }
  ]
}
```

`RECOMMEND_MODE=openai`로 바꾸면 `mode`가 `"openai"`로 바뀌고, 실제로 날씨/기분/못 먹는 음식 등을 반영한 추천 이유가 채워집니다.

**실패 응답**

- `400 Bad Request`: 입력값이 잘못된 경우

  ```json
  { "success": false, "errors": ["peopleCount는 1 이상 20 이하의 정수여야 합니다."] }
  ```

- `500 Internal Server Error`: OpenAI 호출 실패, 서버 오류 등

  ```json
  { "success": false, "errors": ["OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다. .env 파일을 확인해주세요."] }
  ```

### GET /health

서버 상태 확인용 헬스체크입니다. `{"status": "ok"}` 를 반환합니다.

## 5. 프론트엔드 연동 예시

```js
const res = await fetch("http://localhost:3000/api/recommend", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    weather: "비 옴",
    mood: "피곤함",
    peopleCount: 3,
    dislikedFoods: ["오이", "갑각류"],
    recentFoods: ["제육볶음", "김치찌개"],
    foodCount: 5,
  }),
});
const data = await res.json();
console.log(data.recommendations);
```

## 6. 폴더 구조

```
dinner-recommender-backend/
├── src/
│   ├── app.js               # express 앱 설정 (cors, 라우팅, 에러 핸들러)
│   ├── server.js             # 서버 실행 진입점
│   ├── routes/
│   │   └── recommend.js      # POST /api/recommend 라우트
│   ├── services/
│   │   ├── mockRecommendService.js # 고정 메뉴 랜덤 추천 (기본 모드, 결제 불필요)
│   │   └── openaiService.js  # 실제 OpenAI 호출 및 응답 파싱 (RECOMMEND_MODE=openai)
│   └── utils/
│       ├── promptBuilder.js         # OpenAI 프롬프트 생성
│       └── validateRecommendInput.js # 요청 바디 검증
├── package.json
├── .env.example
└── README.md
```

## 7. 커스터마이징 팁

- 메뉴 카테고리(한식/중식/일식/양식/분식 등)를 바꾸고 싶으면 `src/utils/promptBuilder.js`의 스키마 설명을 수정하세요.
- 추천 개수 상한(현재 10개), 인원수 상한(현재 20명)을 바꾸고 싶으면 `src/utils/validateRecommendInput.js`의 상수를 수정하세요.
- mock 모드의 고정 메뉴 10개를 바꾸고 싶으면 `src/services/mockRecommendService.js`의 `FIXED_MENUS` 배열을 수정하세요.
- OpenAI 대신 Anthropic Claude API 등 다른 AI API로 바꾸고 싶으면 `src/services/openaiService.js`만 교체하면 되고, 라우트/검증 로직은 그대로 재사용할 수 있습니다.
- 준비가 되면 `.env`의 `RECOMMEND_MODE`를 `mock`에서 `openai`로 바꾸기만 하면 실제 AI 추천으로 전환됩니다 (코드 수정 불필요).

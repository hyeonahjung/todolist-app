# 프론트엔드 통합 가이드 - TodoListApp

**버전**: 1.0  
**작성일**: 2026-05-14  
**참조 문서**: [PRD v1.1](./2-prd.md) · [설계 원칙 v1.2](./4-design-principles.md) · [아키텍처](./5-arch-diagram.md)

---

## 1. 환경 설정

### 백엔드 서버

| 항목 | 값 |
|------|-----|
| 로컬 개발 URL | `http://localhost:3000` |
| Swagger UI | `http://localhost:3000/api-docs` |
| Health Check | `GET http://localhost:3000/health` |

### 프론트엔드 환경변수 (`.env.local`)

```
VITE_API_BASE_URL=http://localhost:3000
```

### CORS

백엔드는 `CORS_ORIGIN=http://localhost:5173` 으로 설정되어 있습니다.  
프론트엔드 개발 서버 포트가 다르다면 `backend/.env`의 `CORS_ORIGIN` 값을 맞춰 변경하세요.

---

## 2. 공통 응답 형식

모든 API 응답은 아래 구조를 따릅니다.

### 성공

```json
{
  "success": true,
  "data": { ... }
}
```

### 실패

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "오류 설명 메시지",
    "details": [
      { "field": "email", "message": "올바른 이메일 형식이 아닙니다." }
    ]
  }
}
```

> `details` 배열은 유효성 검사 실패(`VALIDATION_ERROR`) 시에만 포함됩니다.

### HTTP 상태 코드

| 상태 코드 | 의미 | 에러 코드 예시 |
|-----------|------|--------------|
| 200 | 성공 (조회·수정) | — |
| 201 | 성공 (생성) | — |
| 204 | 성공 (삭제, 응답 본문 없음) | — |
| 400 | 유효성 검사 실패 / 비밀번호 불일치 | `VALIDATION_ERROR`, `INVALID_PASSWORD` |
| 401 | 인증 필요 / 토큰 만료 | `UNAUTHORIZED`, `TOKEN_EXPIRED` |
| 403 | 권한 없음 | `FORBIDDEN` |
| 404 | 리소스 없음 | `NOT_FOUND` |
| 409 | 중복 데이터 | `DUPLICATE_EMAIL`, `DUPLICATE_CATEGORY` |
| 500 | 서버 내부 오류 | `INTERNAL_ERROR` |

---

## 3. 인증 (Authentication)

### 3-1. 토큰 구조

| 토큰 | 유효기간 | 저장 위치 | 용도 |
|------|---------|----------|------|
| Access Token | 1시간 | Zustand 메모리 | 모든 보호 API 요청 헤더에 첨부 |
| Refresh Token | 7일 | Zustand 메모리 | Access Token 만료 시 재발급 요청 |

> 두 토큰 모두 메모리에만 저장합니다. 페이지 새로고침 시 소멸되어 재로그인이 필요합니다.

### 3-2. 인증 헤더

보호된 모든 엔드포인트에 아래 헤더를 포함해야 합니다.

```
Authorization: Bearer {accessToken}
```

### 3-3. 토큰 자동 갱신 흐름 (axios 인터셉터)

```
1. API 요청 시 Authorization 헤더에 Access Token 첨부
2. 서버가 401 반환 (Access Token 만료)
3. axios 응답 인터셉터가 401 감지
4. POST /api/auth/refresh 요청 (Authorization 헤더에 Refresh Token 첨부)
5. 새 Access Token 발급 → Zustand store 업데이트
6. 실패했던 원래 요청을 새 Access Token으로 재시도
7. Refresh Token도 만료된 경우 → clearAuth() + /auth 리다이렉트
```

---

## 4. API 엔드포인트

### 4-1. 인증 (`/api/auth`)

#### 회원가입

```
POST /api/auth/register
```

**요청 본문**

```json
{
  "email": "user@example.com",
  "password": "Pass1234",
  "name": "홍길동"
}
```

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| email | string | ✅ | RFC 5322 이메일 형식, 최대 255자 |
| password | string | ✅ | 최소 8자, 영문자·숫자 각 1자 이상, 최대 64자 |
| name | string | ✅ | 최소 1자, 최대 50자 |

**응답 `201`**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

---

#### 로그인

```
POST /api/auth/login
```

**요청 본문**

```json
{
  "email": "user@example.com",
  "password": "Pass1234"
}
```

**응답 `200`**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "userId": 1,
      "email": "user@example.com",
      "name": "홍길동",
      "createdAt": "2026-05-14T09:00:00.000Z"
    }
  }
}
```

---

#### 로그아웃

```
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

**응답 `200`**

```json
{ "success": true, "data": null }
```

> 서버 측 처리 없음. 클라이언트에서 Zustand 토큰 초기화를 반드시 수행해야 합니다.

---

#### Access Token 갱신

```
POST /api/auth/refresh
Authorization: Bearer {refreshToken}
```

**응답 `200`**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ..."
  }
}
```

---

### 4-2. 사용자 (`/api/users`)

#### 내 정보 조회

```
GET /api/users/me
Authorization: Bearer {accessToken}
```

**응답 `200`**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "홍길동"
  }
}
```

---

#### 내 정보 수정

```
PATCH /api/users/me
Authorization: Bearer {accessToken}
```

**요청 본문** (모든 필드 선택)

```json
{
  "name": "김철수",
  "currentPassword": "Pass1234",
  "newPassword": "NewPass5678"
}
```

> 비밀번호 변경 시 `currentPassword` + `newPassword` 둘 다 필수입니다.  
> 이름만 변경 시 `name`만 전달해도 됩니다.

**응답 `200`**

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "name": "김철수"
  }
}
```

---

#### 회원 탈퇴

```
DELETE /api/users/me
Authorization: Bearer {accessToken}
```

**요청 본문**

```json
{
  "password": "Pass1234"
}
```

**응답 `204`** (본문 없음)

> 탈퇴 시 해당 사용자의 모든 카테고리·할일이 즉시 삭제됩니다.

---

### 4-3. 카테고리 (`/api/categories`)

#### 카테고리 목록 조회

```
GET /api/categories
Authorization: Bearer {accessToken}
```

**응답 `200`**

```json
{
  "success": true,
  "data": [
    { "categoryId": 1, "name": "일반", "isDefault": true },
    { "categoryId": 2, "name": "업무", "isDefault": true },
    { "categoryId": 3, "name": "개인", "isDefault": true },
    { "categoryId": 4, "name": "운동", "isDefault": false }
  ]
}
```

> `isDefault: true` 항목은 수정·삭제가 불가능합니다. UI에서 수정·삭제 버튼을 비활성화하세요.

---

#### 카테고리 생성

```
POST /api/categories
Authorization: Bearer {accessToken}
```

**요청 본문**

```json
{ "name": "운동" }
```

| 필드 | 규칙 |
|------|------|
| name | 최소 1자, 최대 30자, 동일 사용자 내 중복 불가 |

**응답 `201`**

```json
{
  "success": true,
  "data": { "categoryId": 4, "name": "운동", "isDefault": false }
}
```

---

#### 카테고리 수정

```
PATCH /api/categories/:categoryId
Authorization: Bearer {accessToken}
```

**요청 본문**

```json
{ "name": "헬스" }
```

**응답 `200`**

```json
{
  "success": true,
  "data": { "categoryId": 4, "name": "헬스", "isDefault": false }
}
```

---

#### 카테고리 삭제

```
DELETE /api/categories/:categoryId
Authorization: Bearer {accessToken}
```

**응답 `204`** (본문 없음)

> 삭제된 카테고리에 속한 할일은 자동으로 "일반"(categoryId=1) 카테고리로 이동됩니다.

---

### 4-4. 할일 (`/api/todos`)

#### 할일 목록 조회

```
GET /api/todos
Authorization: Bearer {accessToken}
```

**쿼리 파라미터** (모두 선택)

| 파라미터 | 타입 | 설명 | 예시 |
|----------|------|------|------|
| categoryId | number | 카테고리 필터 | `?categoryId=2` |
| isCompleted | boolean | 완료 여부 필터 | `?isCompleted=false` |
| dueDateFrom | string (YYYY-MM-DD) | 종료예정일 시작 | `?dueDateFrom=2026-05-01` |
| dueDateTo | string (YYYY-MM-DD) | 종료예정일 끝 | `?dueDateTo=2026-05-31` |

**응답 `200`** (등록일시 내림차순 정렬)

```json
{
  "success": true,
  "data": [
    {
      "todoId": 10,
      "userId": 1,
      "categoryId": 2,
      "title": "기획서 작성",
      "description": "1차 기획서 초안",
      "dueDate": "2026-05-20",
      "isCompleted": false,
      "createdAt": "2026-05-14T10:00:00.000Z"
    }
  ]
}
```

---

#### 할일 등록

```
POST /api/todos
Authorization: Bearer {accessToken}
```

**요청 본문**

```json
{
  "title": "기획서 작성",
  "categoryId": 2,
  "description": "1차 기획서 초안",
  "dueDate": "2026-05-20"
}
```

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| title | string | ✅ | 최소 1자, 최대 100자 |
| categoryId | number | ✅ | 본인 소유 또는 기본 카테고리 ID |
| description | string | — | 최대 1,000자 |
| dueDate | string (YYYY-MM-DD) | — | 오늘 이후 날짜만 허용 |

**응답 `201`**

```json
{
  "success": true,
  "data": {
    "todoId": 10,
    "userId": 1,
    "categoryId": 2,
    "title": "기획서 작성",
    "description": "1차 기획서 초안",
    "dueDate": "2026-05-20",
    "isCompleted": false,
    "createdAt": "2026-05-14T10:00:00.000Z"
  }
}
```

---

#### 할일 상세 조회

```
GET /api/todos/:todoId
Authorization: Bearer {accessToken}
```

**응답 `200`** — 위 등록 응답과 동일한 형태

---

#### 할일 수정

```
PATCH /api/todos/:todoId
Authorization: Bearer {accessToken}
```

**요청 본문** (변경할 필드만 전달)

```json
{
  "title": "기획서 최종본 작성",
  "categoryId": 3,
  "description": "최종 검토 포함",
  "dueDate": "2026-05-25"
}
```

> `dueDate`를 `null`로 보내면 종료예정일이 제거됩니다.

**응답 `200`** — 수정된 할일 전체 반환

---

#### 할일 삭제

```
DELETE /api/todos/:todoId
Authorization: Bearer {accessToken}
```

**응답 `204`** (본문 없음)

---

#### 완료 상태 토글

```
PATCH /api/todos/:todoId/completion
Authorization: Bearer {accessToken}
```

> 요청 본문 없음. 호출할 때마다 `isCompleted` 값이 반전됩니다 (false → true → false).

**응답 `200`** — 토글된 할일 전체 반환

---

## 5. 에러 처리 가이드

### 주요 에러 코드

| 코드 | 상태 | 발생 시점 | 처리 방법 |
|------|------|----------|----------|
| `VALIDATION_ERROR` | 400 | 입력값 형식 오류 | `details` 배열의 필드별 메시지를 UI에 표시 |
| `INVALID_PASSWORD` | 400 | 현재 비밀번호 불일치 | 비밀번호 필드에 오류 메시지 표시 |
| `UNAUTHORIZED` | 401 | 인증 정보 없음 / 로그인 실패 | 로그인 화면으로 이동 |
| `TOKEN_EXPIRED` | 401 | Access Token 만료 | 인터셉터가 자동 갱신 처리 |
| `FORBIDDEN` | 403 | 타인 리소스 접근 / 기본 카테고리 수정 시도 | 접근 불가 메시지 표시 |
| `NOT_FOUND` | 404 | 존재하지 않는 리소스 | "존재하지 않습니다" 메시지 표시 |
| `DUPLICATE_EMAIL` | 409 | 이미 가입된 이메일 | "이미 사용 중인 이메일입니다" 표시 |
| `DUPLICATE_CATEGORY` | 409 | 동일 이름의 카테고리 이미 존재 | "이미 존재하는 카테고리명입니다" 표시 |

### axios 인터셉터 예시

```typescript
// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await apiClient.post('/api/auth/refresh', null, {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        original.headers['Authorization'] = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 6. 데이터 타입 정의 (TypeScript)

```typescript
// 공통
interface ApiResponse<T> {
  success: true;
  data: T;
}
interface ApiError {
  success: false;
  error: { code: string; message: string; details?: { field: string; message: string }[] };
}

// 사용자
interface User {
  userId: number;
  email: string;
  name: string;
  createdAt?: string;
}

// 카테고리
interface Category {
  categoryId: number;
  name: string;
  isDefault: boolean;
}

// 할일
interface Todo {
  todoId: number;
  userId: number;
  categoryId: number;
  title: string;
  description: string | null;
  dueDate: string | null;   // YYYY-MM-DD
  isCompleted: boolean;
  createdAt: string;        // ISO 8601
}

// 로그인 응답
interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

---

## 7. 주의사항

- **필드명은 camelCase** 입니다. (`todoId`, `categoryId`, `isCompleted`, `dueDate` 등) Swagger UI의 snake_case 표기와 다르니 주의하세요.
- **카테고리 목록**은 기본 카테고리(일반·업무·개인)를 항상 포함합니다. `isDefault: true`인 항목은 수정·삭제 버튼을 비활성화하세요.
- **할일 삭제된 카테고리**: 카테고리 삭제 시 해당 카테고리의 할일은 서버에서 자동으로 `categoryId: 1`(일반)로 변경됩니다. UI에서 별도 처리가 필요 없습니다.
- **완료 토글**: `PATCH /api/todos/:todoId/completion`은 요청 본문 없이 호출만 하면 됩니다.
- **토큰 저장**: localStorage/sessionStorage에 토큰을 저장하지 마세요. Zustand 메모리 저장이 원칙입니다.

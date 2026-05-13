# 실행 계획서 - TodoListApp

**버전**: 1.0  
**작성일**: 2026-05-13  
**참조 문서**: [PRD v1.1](./2-prd.md) · [설계 원칙](./4-design-principles.md) · [ERD](./6-erd.md) · [아키텍처](./5-arch-diagram.md)

---

## 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0 | 2026-05-13 | 실행계획 전문가 | 최초 작성 — DB·BE·FE 전 영역 태스크 분해 |

---

## 전체 태스크 현황

| 영역 | 태스크 수 | ID 범위 |
|------|----------|---------|
| 데이터베이스 (DB) | 8개 | DB-01 ~ DB-08 |
| 백엔드 (BE) | 9개 | BE-01 ~ BE-09 |
| 프론트엔드 (FE) | 17개 | FE-01 ~ FE-17 |
| **합계** | **34개** | |

---

## 의존성 그래프 요약

```
DB-01 → DB-02 → DB-03 → DB-06
                      ↘
         DB-02 → DB-05 → DB-08
         DB-01 → DB-07

BE-01 → BE-02 → BE-04 → BE-05 → BE-06 → BE-07
                              ↘        ↘ BE-08 → BE-09
                        BE-03 ↗

FE-01 → FE-02 → FE-03 ↘
       → FE-04 ────────→ FE-08 → FE-09
       → FE-05 → FE-06 → FE-07 ↗
                              ↘ FE-10 → FE-11
                              ↘ FE-12 → FE-13 → FE-14 → FE-15
                              ↘ FE-16
                    FE-09+11+13+14+15+16 → FE-17
```

---

## 📦 1영역. 데이터베이스 (DB)

---

### DB-01. PostgreSQL 17 환경 설정 및 데이터베이스 생성
**설명**: 개발 환경에 PostgreSQL 17을 설치하고 `todolist_db` 데이터베이스와 전용 사용자를 생성한다. 이후 모든 DB 작업의 기반이 된다.  
**산출물**: 실행 중인 PostgreSQL 17 인스턴스, `todolist_db` DB, `.env` / `.env.example`  
**의존성**: 없음

#### 완료 조건
- [ ] `psql --version` 실행 시 `PostgreSQL 17.x` 출력 확인
- [ ] `psql -U postgres -c "\l"` 실행 시 `todolist_db`가 목록에 표시됨
- [ ] `.env` 파일에 `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` 항목 모두 작성
- [ ] `.env`가 `.gitignore`에 등록되어 있음
- [ ] `.env.example`에 실제 값 없이 키 목록만 포함되어 있음

---

### DB-02. 스키마 DDL 적용 (users / categories / todos 테이블 생성)
**설명**: `database/schema.sql`을 실행하여 3개 테이블, FK 제약, 부분 유니크 인덱스를 생성한다. ON DELETE CASCADE / SET DEFAULT 정책이 ERD와 일치하는지 확인한다.  
**산출물**: `todolist_db` 내 `users`, `categories`, `todos` 테이블  
**의존성**: DB-01

#### 완료 조건
- [ ] `psql -d todolist_db -f database/schema.sql` 실행 시 오류 없이 완료
- [ ] `\d users` 실행 시 `user_id`, `email`, `password`, `name`, `created_at` 5개 컬럼 확인
- [ ] `\d categories` 실행 시 `category_id`, `name`, `is_default`, `user_id` 4개 컬럼 확인
- [ ] `\d todos` 실행 시 8개 컬럼 (`todo_id`, `user_id`, `category_id`, `title`, `description`, `due_date`, `is_completed`, `created_at`) 확인
- [ ] `\d+ todos`에서 `todos.user_id` FK ON DELETE = `CASCADE` 확인
- [ ] `\d+ todos`에서 `todos.category_id` FK ON DELETE = `SET DEFAULT` 확인
- [ ] `\d+ categories`에서 `categories.user_id` FK ON DELETE = `CASCADE` 확인
- [ ] `todos.category_id`의 DEFAULT 값이 `1`로 설정되어 있음

---

### DB-03. 기본 카테고리 시드 데이터 삽입 및 검증
**설명**: 시스템 기본 카테고리 "일반"(category_id=1), "업무", "개인"을 삽입한다. "일반"이 반드시 id=1이 되도록 DDL 실행 직후 즉시 삽입한다.  
**산출물**: `categories` 테이블에 `is_default=true` 3건 삽입 완료  
**의존성**: DB-02

#### 완료 조건
- [ ] `SELECT * FROM categories WHERE is_default = true;` 결과 3건 ("일반", "업무", "개인") 확인
- [ ] `SELECT category_id FROM categories WHERE name = '일반';` 결과가 `1`임을 확인
- [ ] 기본 카테고리 3건 모두 `user_id IS NULL` 확인
- [ ] `schema.sql` 재실행 후에도 "일반"의 `category_id`가 항상 `1`로 유지됨
- [ ] "일반" 카테고리 재삽입 시 `uq_categories_name_default` 제약으로 오류 발생하여 중복 차단 확인

---

### DB-04. 유니크 인덱스 및 부분 인덱스 검증
**설명**: `categories` 테이블의 두 부분 유니크 인덱스가 BR-04, BR-05 규칙대로 동작하는지 확인한다. 동일 사용자 내 이름 중복은 차단하고, 사용자 간에는 허용해야 한다.  
**산출물**: 유니크 인덱스 동작 검증 결과  
**의존성**: DB-03

#### 완료 조건
- [ ] `SELECT indexname FROM pg_indexes WHERE tablename = 'categories';` 실행 시 `uq_categories_name_user`, `uq_categories_name_default` 두 인덱스 모두 존재
- [ ] 동일 `user_id`로 같은 `name` 카테고리 이중 삽입 시 unique constraint 오류 발생 확인
- [ ] 서로 다른 `user_id`로 동일 `name` 삽입 시 정상 삽입 확인 (사용자 간 허용)
- [ ] `user_id IS NULL`인 기본 카테고리 이름 중복 삽입 시 `uq_categories_name_default` 오류 발생 확인
- [ ] 기본 카테고리와 동일한 이름을 일반 사용자로 삽입 시 허용됨 확인 (부분 인덱스 분리)

---

### DB-05. 성능 인덱스 생성 및 검증
**설명**: 할일 목록 조회의 핵심 필터(카테고리, 완료 여부)와 기본 정렬(등록일시 내림차순)을 위한 인덱스 6개가 정상 생성되었는지, 실행 계획에서 사용되는지 확인한다.  
**산출물**: 인덱스 생성 완료 상태 및 EXPLAIN 결과  
**의존성**: DB-02

#### 완료 조건
- [ ] `pg_indexes` 조회 시 아래 6개 인덱스 모두 존재:
  - `idx_users_email`
  - `idx_categories_user_id`
  - `idx_todos_user_id`
  - `idx_todos_category_id`
  - `idx_todos_user_completed`
  - `idx_todos_created_at`
- [ ] `idx_todos_user_completed`가 `(user_id, is_completed)` 복합 인덱스임 확인
- [ ] `idx_todos_created_at`이 `(created_at DESC)` 내림차순 인덱스임 확인
- [ ] `EXPLAIN SELECT * FROM todos WHERE user_id = 1 ORDER BY created_at DESC;` 에서 Index Scan 사용 확인

---

### DB-06. ON DELETE 연쇄 동작 검증 (CASCADE / SET DEFAULT)
**설명**: 회원 탈퇴(UC-14)와 카테고리 삭제(UC-07) 시나리오의 ON DELETE 정책이 실제 DB에서 의도대로 동작하는지 SQL로 직접 검증한다.  
**산출물**: 연쇄 동작 검증 결과 (수동 SQL 테스트)  
**의존성**: DB-03

#### 완료 조건
- [ ] 테스트 사용자 삽입 → 할일 3건 등록 → 사용자 `DELETE` 후 해당 할일 0건 확인 (CASCADE)
- [ ] 테스트 카테고리 생성 → 할일 2건 등록 → 카테고리 `DELETE` 후 할일의 `category_id`가 `1`("일반")로 변경 확인 (SET DEFAULT)
- [ ] 사용자 삭제 후 해당 사용자의 사용자 정의 카테고리도 0건 확인 (CASCADE)
- [ ] 테스트 데이터 정리 후 DB가 시드 데이터만 남은 상태로 복원 확인

---

### DB-07. pg Pool 연결 설정 구현 및 검증
**설명**: 백엔드 `src/config/db.js`에 `pg.Pool` 싱글턴을 생성하고 `.env` 환경변수로 연결을 구성한다. 모든 Repository가 이 인스턴스만 사용하도록 한다.  
**산출물**: `src/config/db.js`, `src/config/env.js`  
**의존성**: DB-01

#### 완료 조건
- [ ] `src/config/db.js`에 `new Pool({...})` 형태로 Pool 생성 및 export 확인
- [ ] `src/config/env.js`에서 필수 환경변수 누락 시 에러를 throw하고 프로세스 종료 확인
- [ ] 서버 기동 시 `pool.query('SELECT 1')` 성공 후 "DB 연결 성공" 로그 출력 확인
- [ ] 잘못된 `DB_PASSWORD`로 기동 시 연결 실패 에러 즉시 출력 확인
- [ ] Pool에 `max`, `idleTimeoutMillis`, `connectionTimeoutMillis` 값 명시 확인
- [ ] Repository 파일에서만 pool을 import하고 Controller·Service에서 직접 import하지 않음 확인

---

### DB-08. 마이그레이션 재현성 검증 및 운영 절차 문서화
**설명**: `schema.sql`을 빈 DB에 재실행했을 때 항상 동일한 결과를 얻을 수 있는지(멱등성) 확인하고, 초기화 절차를 누구나 재현 가능하도록 정리한다.  
**산출물**: `npm run db:init` 스크립트 또는 README DB 설정 섹션  
**의존성**: DB-03, DB-05

#### 완료 조건
- [ ] `schema.sql` 두 번 연속 실행 시 오류 없이 완료 (`DROP TABLE IF EXISTS` 확인)
- [ ] 재실행 후 `SELECT count(*) FROM categories WHERE is_default = true;` 결과 항상 `3` 확인
- [ ] 재실행 후 "일반" 카테고리의 `category_id`가 항상 `1`임을 확인
- [ ] `package.json`의 `scripts`에 `"db:init"` 명령 등록 또는 README에 실행 명령 명시 확인
- [ ] README DB 설정 섹션만 따라도 신규 개발자가 로컬 DB를 정상 기동 가능한 수준 확인

---

## 🖥️ 2영역. 백엔드 (BE)

---

### BE-01. 프로젝트 초기화 및 디렉토리 구조 설정
**설명**: Express 서버를 위한 패키지 설치, 디렉토리 구조 생성, 환경변수 파일 구성을 수행한다. 이후 모든 BE 태스크의 기반이 된다.  
**산출물**: `backend/package.json`, `backend/server.js`, `src/app.js`, 전체 디렉토리 골격  
**의존성**: 없음

#### 완료 조건
- [ ] `package.json`에 `express`, `pg`, `bcrypt`, `jsonwebtoken`, `dotenv`, `joi` 의존성 설치 완료
- [ ] 개발 의존성 `nodemon`, `jest`, `supertest` 설치 완료
- [ ] `src/` 하위에 `config/`, `routes/`, `controllers/`, `services/`, `repositories/`, `middlewares/`, `schemas/`, `errors/`, `utils/` 디렉토리 모두 생성
- [ ] `__tests__/unit/`, `__tests__/integration/`, `__tests__/fixtures/` 디렉토리 생성
- [ ] `.env.example`에 `PORT`, `NODE_ENV`, `DB_*`, `JWT_*`, `BCRYPT_SALT_ROUNDS` 항목 모두 포함
- [ ] `.env`가 `.gitignore`에 등록되어 있음
- [ ] `npm run dev` 실행 시 "Server running on port 3000" 출력 확인
- [ ] `npm test` 실행 시 jest가 실행됨 확인

---

### BE-02. 환경변수 모듈 및 pg Pool 설정
**설명**: `config/env.js`에서 환경변수를 한 곳에서 읽고 유효성을 검사하며, `config/db.js`에서 pg Pool 싱글턴을 생성한다. 모든 Repository의 선행 조건이다.  
**산출물**: `src/config/env.js`, `src/config/db.js`  
**의존성**: BE-01

#### 완료 조건
- [ ] `config/env.js`에서 필수 환경변수 누락 시 `"Missing required env variable: {KEY}"` 에러 throw 확인
- [ ] `config/db.js`에서 `new Pool({...})`으로 인스턴스 생성 및 `module.exports`로 export 확인
- [ ] 서버 기동 시 `pool.query('SELECT NOW()')` 성공 후 "Database connected" 로그 출력 확인
- [ ] 잘못된 DB 비밀번호로 기동 시 연결 실패 에러 출력 및 프로세스 종료 확인
- [ ] Repository 파일에서 `const pool = require('../config/db')`로 Pool import 확인

---

### BE-03. 공통 에러 클래스 및 전역 에러 핸들러 구현
**설명**: `AppError` 커스텀 에러 클래스와 Express 전역 에러 핸들러를 구현하여 서비스 전체에서 일관된 에러 응답 형식을 보장한다.  
**산출물**: `src/errors/AppError.js`, `src/app.js` (에러 핸들러 등록)  
**의존성**: BE-01

#### 완료 조건
- [ ] `AppError`가 `statusCode`, `code`, `message`를 받으며 `Error`를 상속 확인
- [ ] 에러 핸들러가 `AppError`를 `{ success: false, error: { code, message } }` 형태로 응답 확인
- [ ] 예상치 못한 에러는 500과 `{ code: "INTERNAL_ERROR" }`로 응답하며 스택 트레이스 미노출 확인
- [ ] 존재하지 않는 라우트 호출 시 404 응답 확인
- [ ] `NODE_ENV=production`일 때 응답에 `stack` 필드 미포함 확인

---

### BE-04. JWT 유틸리티 및 bcrypt 유틸리티 구현
**설명**: Access/Refresh Token 서명·검증 함수와 bcrypt 해시 생성·비교 함수를 구현한다. 인증 서비스(BE-06)의 선행 조건이다.  
**산출물**: `src/utils/jwt.util.js`, `src/utils/hash.util.js`  
**의존성**: BE-02

#### 완료 조건
- [ ] `signAccessToken(payload)` — `JWT_ACCESS_SECRET` + `JWT_ACCESS_EXPIRES_IN`(1h) 사용하여 JWT 발급
- [ ] `signRefreshToken(payload)` — `JWT_REFRESH_SECRET` + `JWT_REFRESH_EXPIRES_IN`(7d) 사용하여 JWT 발급
- [ ] `verifyToken(token, secret)` — 만료 토큰에 `AppError(401, 'UNAUTHORIZED', ...)` throw 확인
- [ ] `hashPassword(plain)` — `BCRYPT_SALT_ROUNDS`(10) 적용하여 해시 생성 확인
- [ ] `comparePassword(plain, hash)` — 일치 시 `true`, 불일치 시 `false` 반환 확인
- [ ] 단위 테스트에서 정상 케이스 및 예외 케이스(만료 토큰, 잘못된 시크릿, 비밀번호 불일치) 모두 통과

---

### BE-05. 인증 미들웨어 및 입력값 유효성 검사 미들웨어 구현
**설명**: `authenticate.middleware.js`는 Bearer 토큰을 검증하고 `req.user`를 설정하며, `validate.middleware.js`는 Joi 스키마로 요청 입력값을 검증한다. 모든 도메인 라우터의 공통 선행 조건이다.  
**산출물**: `src/middlewares/authenticate.middleware.js`, `src/middlewares/validate.middleware.js`  
**의존성**: BE-03, BE-04

#### 완료 조건
- [ ] `authenticate` 미들웨어 — `Authorization` 헤더 없을 때 `AppError(401, 'UNAUTHORIZED', ...)` next 전달 확인
- [ ] `authenticate` 미들웨어 — 유효한 토큰일 때 `req.user = { userId, email }` 설정 및 `next()` 호출 확인
- [ ] `authenticate` 미들웨어 — 만료 토큰에 401 반환 확인
- [ ] `validate(schema)` 미들웨어 — `schema.body/params/query` 검사 실패 시 `AppError(400, 'VALIDATION_ERROR', ...)` + `details` 배열 전달 확인
- [ ] 인증 헤더 없이 보호 라우트 호출 시 `{ success: false, error: { code: "UNAUTHORIZED" } }` 401 응답 확인

---

### BE-06. 인증 API 구현 (회원가입, 로그인, 로그아웃, 토큰 갱신)
**설명**: UC-01(회원가입), UC-02(로그인), UC-03(로그아웃), 토큰 갱신 엔드포인트를 구현한다. bcrypt 암호화, JWT 발급, 이메일 중복 검증을 포함한다.  
**산출물**: `src/schemas/auth.schema.js`, `src/repositories/user.repository.js`(일부), `src/services/auth.service.js`, `src/controllers/auth.controller.js`, `src/routes/auth.routes.js`  
**의존성**: BE-02, BE-03, BE-04, BE-05

#### 완료 조건
- [ ] **UC-01 / BR-01** — `POST /api/auth/register` 호출 시 201 Created + `{ success: true, data: { userId, email, name } }` 반환 확인
- [ ] **UC-01** — 비밀번호가 DB에 bcrypt 해시로 저장되며 평문 저장 없음 확인
- [ ] **UC-01 / SC-01 [E-02]** — 중복 이메일 등록 시 409 + `{ code: "DUPLICATE_EMAIL" }` 반환 확인
- [ ] **UC-01 / PRD 3.2** — 이메일 형식 오류, 비밀번호 8자 미만 등 유효성 실패 시 400 + 필드별 오류 메시지 반환 확인
- [ ] **UC-02 / BR-01** — `POST /api/auth/login` 올바른 자격증명 시 200 + `{ success: true, data: { accessToken, refreshToken, user } }` 반환 확인
- [ ] **UC-02** — Access Token payload에 `userId`, `email` 포함 및 만료 1시간 확인 (`jwt.io` 디코딩)
- [ ] **UC-02 / SC-02 [E-01]** — 잘못된 자격증명 시 401 + `{ code: "UNAUTHORIZED" }` 반환 확인
- [ ] **UC-03** — `POST /api/auth/logout` 호출 시 200 + `{ success: true, data: null }` 반환 확인
- [ ] **토큰 갱신** — `POST /api/auth/refresh`에 유효한 Refresh Token(`Authorization: Bearer`) 전달 시 새 Access Token 반환 확인
- [ ] **SC-02 [E-03]** — 만료된 Refresh Token으로 `/refresh` 호출 시 401 반환 확인
- [ ] `__tests__/integration/auth.routes.test.js` — 회원가입 → 로그인 → 보호 API 접근 흐름 통합 테스트 통과

---

### BE-07. 사용자 API 구현 (내 정보 조회, 개인정보 수정, 회원 탈퇴)
**설명**: UC-04(개인정보 수정)와 UC-14(회원 탈퇴)를 구현한다. 비밀번호 변경 시 현재 비밀번호 확인, 탈퇴 시 트랜잭션 일괄 삭제 로직을 포함한다.  
**산출물**: `src/schemas/user.schema.js`, `src/repositories/user.repository.js`(완성), `src/services/user.service.js`, `src/controllers/user.controller.js`, `src/routes/user.routes.js`  
**의존성**: BE-05, BE-06

#### 완료 조건
- [ ] **UC-04** — `GET /api/users/me` 호출 시 200 + `{ userId, email, name }` 반환 확인
- [ ] **UC-04 / BR-07** — `PATCH /api/users/me`로 이름 수정 시 200 + 수정된 이름 반환 확인
- [ ] **UC-04 / SC-03** — 비밀번호 변경 시 `currentPassword` + `newPassword` 전달하면 200 반환 및 새 비밀번호로 로그인 성공 확인
- [ ] **SC-03 [E-01]** — 현재 비밀번호 불일치 시 400 + 오류 메시지 반환 확인
- [ ] **UC-14 / BR-07** — `DELETE /api/users/me`에 비밀번호 전달 시 204 반환 및 Todo·Category·User 전체 삭제 확인
- [ ] **SC-04 [E-01]** — 탈퇴 시 비밀번호 불일치 시 400 반환 확인
- [ ] **PRD 4.3** — 탈퇴 후 동일 이메일 로그인 시 401 반환하여 계정 완전 삭제 확인
- [ ] **트랜잭션** — 탈퇴 처리 중 오류 발생 시 전체 롤백 확인 (원자성)
- [ ] 인증 없이 `PATCH/DELETE /api/users/me` 호출 시 401 반환 확인
- [ ] `__tests__/unit/user.service.test.js` — 비밀번호 검증 및 탈퇴 트랜잭션 단위 테스트 통과

---

### BE-08. 카테고리 API 구현 (목록 조회, 등록, 수정, 삭제)
**설명**: UC-05~07을 구현한다. 기본 카테고리 수정·삭제 보호(BR-04), 카테고리 삭제 시 할일을 "일반"으로 이동하는 정책(PRD UC-07)을 포함한다.  
**산출물**: `src/schemas/category.schema.js`, `src/repositories/category.repository.js`, `src/services/category.service.js`, `src/controllers/category.controller.js`, `src/routes/category.routes.js`  
**의존성**: BE-05, BE-06

#### 완료 조건
- [ ] **UC-05** — `GET /api/categories` 호출 시 기본 + 사용자 정의 카테고리 전체 200 반환 확인
- [ ] **UC-05 / BR-05** — `POST /api/categories` 유효한 이름 전달 시 201 + 생성된 카테고리 정보 반환 확인
- [ ] **SC-05 [E-01]** — 동일 사용자 내 중복 카테고리명 등록 시 409 + `{ code: "DUPLICATE_CATEGORY" }` 반환 확인
- [ ] **PRD 3.2** — 카테고리명 빈 문자열 또는 30자 초과 시 400 + 필드 오류 메시지 반환 확인
- [ ] **UC-06 / BR-04** — 사용자 정의 카테고리 수정 시 200 + 수정된 정보 반환 확인
- [ ] **UC-06 / SC-06 [E-01]** — 기본 카테고리 수정 요청 시 403 + `{ code: "FORBIDDEN" }` 반환 확인
- [ ] **UC-07 / BR-04** — 기본 카테고리 삭제 요청 시 403 반환 확인
- [ ] **UC-07 / SC-07** — 할일이 있는 카테고리 삭제 시 해당 할일의 `category_id`가 "일반"으로 변경되고 204 반환 확인 (DB 직접 조회 검증)
- [ ] 타인 소유 카테고리 수정·삭제 요청 시 403 또는 404 반환 확인
- [ ] `__tests__/integration/category.routes.test.js` — 카테고리 삭제 후 할일 이동 흐름 통합 테스트 통과

---

### BE-09. 할일 API 구현 (CRUD + 완료 처리 + 목록 조회 필터링)
**설명**: UC-08~13 전체를 구현한다. 소유권 검증(BR-02), 카테고리 소유권 검증, 동적 WHERE 절 기반 필터링을 포함한다.  
**산출물**: `src/schemas/todo.schema.js`, `src/repositories/todo.repository.js`, `src/services/todo.service.js`, `src/controllers/todo.controller.js`, `src/routes/todo.routes.js`  
**의존성**: BE-05, BE-06, BE-08

#### 완료 조건
- [ ] **UC-08 / BR-02,03** — `POST /api/todos` 제목·카테고리ID 전달 시 201 + 생성된 할일 반환 확인
- [ ] **PRD 3.2** — 제목 누락, 100자 초과, 설명 1,000자 초과, 과거 날짜 입력 시 400 + 필드 오류 반환 확인
- [ ] **UC-08** — 타인 소유 카테고리 ID로 할일 등록 시도 시 403 또는 404 반환 확인
- [ ] **UC-09 / BR-02** — `PATCH /api/todos/:todoId` 일부 필드만 수정 시 200 + 수정된 할일 반환 확인
- [ ] **UC-09 / SC-08 [E-01]** — 타인 소유 할일 수정 요청 시 403 또는 404 반환 확인
- [ ] **UC-10 / BR-02** — `DELETE /api/todos/:todoId` 본인 소유 삭제 시 204 + DB 레코드 삭제 확인
- [ ] **UC-10 / SC-09 [E-01]** — 타인 소유 할일 삭제 요청 시 403 또는 404 반환 확인
- [ ] **UC-11 / BR-02** — `PATCH /api/todos/:todoId/completion` 호출 시 `isCompleted` 토글 및 200 반환 확인
- [ ] **UC-12 / BR-02,06** — `GET /api/todos` 호출 시 본인 할일 전체 등록일시 내림차순 200 반환 확인
- [ ] **UC-12 / SC-10** — `?categoryId=`, `?isCompleted=`, `?dueDateFrom=&dueDateTo=` 각각 및 조합 필터링 정확히 동작 확인
- [ ] **UC-13 / BR-02** — `GET /api/todos/:todoId` 본인 소유 상세 조회 시 전체 정보 200 반환 확인
- [ ] **SC-11 [E-02]** — 삭제된 할일 ID 조회 시 404 + `{ code: "NOT_FOUND" }` 반환 확인
- [ ] `__tests__/unit/todo.service.test.js` — BR-02 소유권 검증 로직 단위 테스트 통과
- [ ] `__tests__/integration/todo.routes.test.js` — 타인 토큰으로 할일 접근 시 403 통합 테스트 통과

---

## 🎨 3영역. 프론트엔드 (FE)

---

### FE-01. 프로젝트 초기화 (Vite + React 19 + TypeScript 세팅)
**설명**: Vite 기반 React 19 + TypeScript 프로젝트를 생성하고 ESLint/Prettier/tsconfig 등 개발 환경 공통 설정을 완료한다. 모든 FE 태스크의 기반이 된다.  
**산출물**: `frontend/` 디렉토리, `vite.config.ts`, `tsconfig.json`, `package.json`, `.env.example`  
**의존성**: 없음

#### 완료 조건
- [ ] React 19 + TypeScript 템플릿으로 Vite 프로젝트 생성 확인
- [ ] `tsconfig.json`에 `strict: true`, `noImplicitAny: true`, `strictNullChecks: true` 활성화 확인
- [ ] ESLint (TypeScript 규칙 포함) 및 Prettier (탭 2칸, 세미콜론, 작은따옴표) 설정 완료 확인
- [ ] `VITE_API_BASE_URL` 환경변수를 `.env.example`에 정의 및 `.env.local`에 실제 값 설정 확인
- [ ] `src/api/`, `src/stores/`, `src/hooks/`, `src/pages/`, `src/components/`, `src/types/` 디렉토리 사전 생성 확인
- [ ] `npm run dev` 실행 후 브라우저에서 빈 React 앱 로드 확인

---

### FE-02. 공통 타입 정의
**설명**: 백엔드 API 응답 구조 및 각 도메인 엔티티(User, Category, Todo)에 대응하는 TypeScript 인터페이스를 정의한다. 모든 API 함수와 훅의 타입 안전성 확보를 위한 선행 작업이다.  
**산출물**: `src/types/common.types.ts`, `src/types/user.types.ts`, `src/types/category.types.ts`, `src/types/todo.types.ts`  
**의존성**: FE-01

#### 완료 조건
- [ ] `common.types.ts`에 `ApiResponse<T>`, `ApiError` 공통 타입 정의 확인
- [ ] `user.types.ts`에 `User`, `UpdateUserRequest`, `DeleteUserRequest` 인터페이스 정의 확인
- [ ] `category.types.ts`에 `Category`, `CreateCategoryRequest`, `UpdateCategoryRequest` 인터페이스 정의 확인
- [ ] `todo.types.ts`에 `Todo`, `CreateTodoRequest`, `UpdateTodoRequest`, `TodoFilter` 인터페이스 정의 확인
- [ ] 모든 타입 파일에서 `any` 미사용 및 TypeScript 컴파일 에러 없음 확인

---

### FE-03. axios 클라이언트 설정 (인터셉터: 토큰 자동 첨부 + 401 자동 갱신)
**설명**: axios 인스턴스를 생성하고 요청 인터셉터(Access Token 첨부)와 응답 인터셉터(401 수신 시 Refresh Token으로 자동 갱신 후 재시도)를 구현한다.  
**산출물**: `src/api/apiClient.ts`  
**의존성**: FE-01, FE-02

#### 완료 조건
- [ ] `baseURL`이 `VITE_API_BASE_URL` 환경변수를 참조하는 axios 인스턴스 생성 확인
- [ ] 요청 인터셉터 — `useAuthStore`에서 `accessToken`을 읽어 `Authorization: Bearer {token}` 헤더 자동 첨부 확인
- [ ] 응답 인터셉터 — 401 수신 시 `POST /api/auth/refresh`를 Refresh Token으로 호출하여 새 Access Token 발급 후 `useAuthStore` 업데이트 확인
- [ ] 갱신 성공 후 원래 실패 요청을 새 토큰으로 자동 재시도 확인
- [ ] Refresh Token도 만료(refresh 요청 401) 시 `clearAuth()` 호출 + `/auth`로 리다이렉트 확인 (SC-02 E-03)
- [ ] 동시 다중 401 요청 시 토큰 갱신 요청이 1회만 발생하고 나머지는 대기 후 재시도 확인

---

### FE-04. Zustand 인증 스토어 (accessToken, refreshToken, user 상태)
**설명**: 로그인·로그아웃·토큰 갱신에 따른 인증 상태를 Zustand 메모리 스토어로 관리한다. 페이지 새로고침 시 토큰 소멸 정책을 반영한다.  
**산출물**: `src/stores/useAuthStore.ts`  
**의존성**: FE-01, FE-02

#### 완료 조건
- [ ] `accessToken: string | null`, `refreshToken: string | null`, `user: User | null` 상태 정의 확인
- [ ] `setAuth(accessToken, refreshToken, user)` — 세 값 동시 저장 확인
- [ ] `setAccessToken(accessToken)` — 토큰 갱신 시 Access Token만 업데이트 확인
- [ ] `clearAuth()` — 모든 인증 상태 null 초기화 확인
- [ ] 스토어가 `localStorage`/`sessionStorage`에 토큰을 저장하지 않음 확인
- [ ] 로그인 후 페이지 새로고침 시 스토어 초기화 및 로그인 화면 이동 확인

---

### FE-05. TanStack Query 설정 (QueryClient)
**설명**: `QueryClient`를 생성하고 `QueryClientProvider`로 앱 전체에 주입한다. 전역 에러 처리 및 공통 옵션을 설정한다.  
**산출물**: `src/main.tsx` (QueryClientProvider 등록 포함)  
**의존성**: FE-01

#### 완료 조건
- [ ] `QueryClient` 인스턴스에 `defaultOptions` (`staleTime`, `retry` 등) 설정 확인
- [ ] `src/main.tsx`에서 `<QueryClientProvider client={queryClient}>` 로 앱 전체 감싸기 확인
- [ ] 개발 환경에서 `ReactQueryDevtools` 컴포넌트 렌더링 확인
- [ ] 브라우저 개발자도구에서 QueryDevtools 패널 정상 노출 확인

---

### FE-06. 라우팅 설정 (공개/보호 라우트)
**설명**: React Router로 공개 라우트(`/auth`)와 보호 라우트(`/`, `/todos/:todoId`, `/categories`, `/profile`)를 정의한다. 미인증 상태에서 보호 라우트 접근 시 `/auth`로 리다이렉트하는 `ProtectedRoute` 컴포넌트를 구현한다.  
**산출물**: `src/router.tsx`, `src/components/layout/ProtectedRoute.tsx`  
**의존성**: FE-04, FE-05

#### 완료 조건
- [ ] `/auth` → `AuthPage`, `/` → `TodoListPage`, `/todos/:todoId` → `TodoDetailPage`, `/categories` → `CategoryPage`, `/profile` → `ProfilePage` 라우팅 확인
- [ ] `ProtectedRoute` — `accessToken`이 null이면 `<Navigate to="/auth" replace />` 처리 확인
- [ ] 비로그인 상태로 `/` 접속 시 `/auth`로 즉시 리다이렉트 확인
- [ ] 로그인 상태로 `/auth` 접속 시 `/`로 리다이렉트 확인

---

### FE-07. 레이아웃 및 공통 컴포넌트
**설명**: 공통 레이아웃(네비게이션 바)과 Modal, ConfirmDialog, ErrorMessage, LoadingSpinner 등 재사용 가능한 UI 컴포넌트를 구현한다.  
**산출물**: `src/components/layout/AppLayout.tsx`, `src/components/common/Modal.tsx`, `ConfirmDialog.tsx`, `ErrorMessage.tsx`, `LoadingSpinner.tsx`  
**의존성**: FE-06

#### 완료 조건
- [ ] `AppLayout.tsx` — 네비게이션 바(앱 제목, 카테고리 관리·프로필 링크, 로그아웃 버튼) 구현 확인
- [ ] 로그아웃 버튼 클릭 시 `clearAuth()` 호출 + `/auth` 이동 확인 (UC-03)
- [ ] `Modal.tsx` — `isOpen`, `onClose`, `title`, `children` props 기반 오버레이 모달 구현 확인
- [ ] `ConfirmDialog.tsx` — 메시지, 확인·취소 콜백 props 기반 확인 다이얼로그 구현 확인
- [ ] `ErrorMessage.tsx`, `LoadingSpinner.tsx` 구현 확인
- [ ] 로그인 후 메인 화면에서 네비게이션 바 정상 렌더링 브라우저 확인

---

### FE-08. 인증 API 함수 및 훅 구현 (회원가입, 로그인, 로그아웃)
**설명**: 회원가입(UC-01), 로그인(UC-02), 로그아웃(UC-03) API 함수와 TanStack Query `useMutation` 기반 훅을 구현한다. 로그인 성공 시 `setAuth()`로 토큰·사용자 정보를 저장한다.  
**산출물**: `src/api/auth.api.ts`, `src/hooks/auth/useRegister.ts`, `useLogin.ts`, `useLogout.ts`  
**의존성**: FE-03, FE-04, FE-05

#### 완료 조건
- [ ] `auth.api.ts`에 `register`, `login`, `logout`, `refreshToken` 함수 구현 및 반환 타입 정의 확인
- [ ] `useLogin` — 성공 시 `setAuth(accessToken, refreshToken, user)` 호출 + `/`로 이동 확인 (SC-02)
- [ ] `useLogout` — `POST /api/auth/logout` 후 `clearAuth()` 실행 + `/auth` 이동 확인 (UC-03)
- [ ] `useRegister` — 성공 시 로그인 화면 이동 + 성공 메시지 표시 확인 (SC-01)
- [ ] 모든 훅에서 에러 발생 시 `ApiError.message`를 UI에 노출하는 처리 확인

---

### FE-09. 인증 화면 UI (회원가입, 로그인)
**설명**: 회원가입(UC-01)과 로그인(UC-02) 폼을 `AuthPage` 하나에서 탭/토글 방식으로 제공한다. 입력값 유효성 검증을 클라이언트 측에서 실시간으로 처리한다.  
**산출물**: `src/pages/AuthPage.tsx`  
**의존성**: FE-07, FE-08

#### 완료 조건
- [ ] 로그인 폼 — 이메일, 비밀번호 입력 필드 + "로그인" 버튼 렌더링 확인
- [ ] 회원가입 폼 — 이름, 이메일, 비밀번호 입력 필드 + "가입하기" 버튼 렌더링 확인
- [ ] 이메일 형식 오류 시 "올바른 이메일 형식을 입력해 주세요." 메시지 표시 확인 (SC-01 E-01)
- [ ] 비밀번호 8자 미만 또는 영문·숫자 미포함 시 오류 메시지 표시 확인 (SC-01 E-03)
- [ ] 이메일·비밀번호 불일치 서버 에러 시 오류 메시지 표시 확인 (SC-02 E-01)
- [ ] 이메일 중복 서버 에러 시 "이미 사용 중인 이메일입니다." 메시지 표시 확인 (SC-01 E-02)
- [ ] 로그인 성공 후 `/`(할일 목록 메인 화면)으로 이동 확인 (SC-02 기본 흐름 6단계)

---

### FE-10. 카테고리 API 함수 및 훅 구현
**설명**: 카테고리 목록 조회, 등록(UC-05), 수정(UC-06), 삭제(UC-07) API 함수와 TanStack Query 훅을 구현한다. 뮤테이션 성공 시 `['categories']` 쿼리 키를 무효화하여 목록을 자동 갱신한다.  
**산출물**: `src/api/category.api.ts`, `src/hooks/categories/useCategories.ts`, `useCreateCategory.ts`, `useUpdateCategory.ts`, `useDeleteCategory.ts`  
**의존성**: FE-03, FE-05

#### 완료 조건
- [ ] `category.api.ts`에 `getCategories`, `createCategory`, `updateCategory`, `deleteCategory` 함수 구현 확인
- [ ] `useCategories` — 인증 상태일 때만 요청하는 `enabled` 조건 포함 확인
- [ ] `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory` — 성공 시 `['categories']` 캐시 무효화 확인
- [ ] 각 훅에서 API 에러(409 중복, 400 유효성 오류 등)를 `ApiError` 타입으로 처리 확인

---

### FE-11. 카테고리 관리 UI
**설명**: 카테고리 목록 표시, 등록·수정 폼, 삭제 확인 다이얼로그를 구현한다. `isDefault` 속성에 따라 기본 카테고리의 수정·삭제 버튼을 비활성화한다.  
**산출물**: `src/pages/CategoryPage.tsx`, `src/components/category/CategoryList.tsx`, `CategoryForm.tsx`  
**의존성**: FE-07, FE-10

#### 완료 조건
- [ ] 기본 카테고리(일반, 업무, 개인) 수정·삭제 버튼 비활성화 확인 (BR-04)
- [ ] "카테고리 추가" 버튼 클릭 시 등록 폼 표시 확인
- [ ] 카테고리명 30자 초과 시 오류 메시지 표시 확인 (SC-05 E-02)
- [ ] 중복 카테고리명 시 "이미 존재하는 카테고리명입니다." 표시 확인 (SC-05 E-01)
- [ ] 삭제 버튼 클릭 시 `ConfirmDialog` 표시 + 할일 존재 시 "소속 할일은 '일반' 카테고리로 이동됩니다." 안내 포함 확인 (SC-07 기본 흐름 3단계)
- [ ] 삭제 확인 후 카테고리 목록에서 즉시 제거 확인

---

### FE-12. 할일 API 함수 및 훅 구현
**설명**: 할일 목록 조회(필터링 포함, UC-12), 단건 조회(UC-13), 등록(UC-08), 수정(UC-09), 삭제(UC-10), 완료 토글(UC-11) API 함수와 TanStack Query 훅을 구현한다.  
**산출물**: `src/api/todo.api.ts`, `src/hooks/todos/useTodos.ts`, `useTodo.ts`, `useCreateTodo.ts`, `useUpdateTodo.ts`, `useDeleteTodo.ts`, `useToggleTodoCompletion.ts`  
**의존성**: FE-03, FE-05

#### 완료 조건
- [ ] `todo.api.ts`에 `getTodos(filter)`, `getTodoById`, `createTodo`, `updateTodo`, `deleteTodo`, `toggleCompletion` 함수 구현 및 반환 타입 정의 확인
- [ ] `getTodos`가 `categoryId`, `isCompleted`, `dueDateFrom`, `dueDateTo` 쿼리 파라미터 지원 확인 (UC-12)
- [ ] `useTodos` — `TodoFilter` 객체를 쿼리 키 `['todos', filter]`에 포함하여 필터 변경 시 자동 refetch 확인
- [ ] 생성·수정·삭제·완료토글 뮤테이션 성공 시 `['todos']` 캐시 무효화 확인

---

### FE-13. 할일 목록 + 필터링 UI
**설명**: 메인 화면인 할일 목록 페이지를 구현한다. 카테고리/완료 여부/종료예정일 기간 필터 UI와 함께 등록일시 내림차순으로 정렬된 할일 목록을 표시한다.  
**산출물**: `src/pages/TodoListPage.tsx`, `src/components/todo/TodoList.tsx`, `TodoCard.tsx`, `FilterBar.tsx`  
**의존성**: FE-07, FE-10, FE-12

#### 완료 조건
- [ ] `FilterBar.tsx` — 카테고리 드롭다운, 완료 여부 선택(전체/완료/미완료), 종료예정일 기간 날짜 입력 UI 구현 확인 (UC-12)
- [ ] "필터 초기화" 버튼 클릭 시 모든 필터 제거 및 전체 목록 등록일시 내림차순 표시 확인 (SC-10 A-01)
- [ ] `TodoCard.tsx` — 제목, 카테고리명, 종료예정일, 완료 여부, 수정·삭제 버튼 표시 확인
- [ ] 완료 체크박스 클릭 시 `useToggleTodoCompletion` 호출 및 목록에 완료 상태 즉시 반영 확인 (UC-11)
- [ ] 필터 조건에 맞는 할일 없을 시 "조건에 맞는 할일이 없습니다." 메시지 표시 확인 (SC-10 E-01)
- [ ] 로딩 중 `LoadingSpinner` 표시, 오류 시 `ErrorMessage` 표시 확인
- [ ] 카테고리 필터 변경 후 해당 카테고리 할일만 목록에 표시 브라우저 확인

---

### FE-14. 할일 등록/수정/삭제 UI
**설명**: 할일 등록(UC-08), 수정(UC-09), 삭제(UC-10) 기능을 위한 폼과 삭제 확인 다이얼로그를 구현한다. 등록·수정을 `TodoForm` 하나로 처리하며 PRD 3.2 유효성 검증 규칙을 적용한다.  
**산출물**: `src/components/todo/TodoForm.tsx`  
**의존성**: FE-07, FE-10, FE-12, FE-13

#### 완료 조건
- [ ] `TodoForm.tsx` — 제목(필수, 최대 100자), 카테고리 드롭다운(필수), 설명(선택, 최대 1,000자), 종료예정일(선택) 필드 구현 확인 (UC-08)
- [ ] 수정 모드 시 기존 데이터가 초기값으로 채워짐 확인 (SC-08 기본 흐름 3단계)
- [ ] 각 필드 유효성 실패 시 필드별 오류 메시지 표시 확인 (SC-05 E-03~07)
- [ ] 종료예정일로 오늘 이전 날짜 선택 시 "오늘 이후 날짜로 설정해 주세요." 표시 확인
- [ ] 등록 성공 후 폼이 닫히고 목록에 새 항목 즉시 추가 확인
- [ ] 수정 성공 후 목록에 변경 사항 즉시 반영 확인
- [ ] 삭제 버튼 클릭 시 `ConfirmDialog` 표시 및 삭제 확인 후 목록에서 즉시 제거 확인 (SC-09)

---

### FE-15. 할일 상세 조회 UI
**설명**: 할일 카드 클릭 시 해당 할일의 전체 정보(제목, 설명, 카테고리명, 종료예정일, 완료 여부, 등록일시, 최종 수정일시)를 표시하는 상세 페이지 또는 모달을 구현한다.  
**산출물**: `src/pages/TodoDetailPage.tsx`  
**의존성**: FE-07, FE-12, FE-14

#### 완료 조건
- [ ] 할일 클릭 시 `/todos/:todoId` 또는 모달로 이동 확인 (SC-11 기본 흐름 1단계)
- [ ] 제목, 설명, 카테고리명, 종료예정일, 완료 여부, 등록일시, 최종 수정일시 전체 표시 확인 (UC-13)
- [ ] "수정" 버튼 클릭 시 `TodoForm` 수정 모드 진입 확인 (SC-11 A-01)
- [ ] 완료 토글 동작 확인 (SC-11 A-02, UC-11)
- [ ] "삭제" 버튼 클릭 시 삭제 확인 다이얼로그 → 삭제 후 목록 화면으로 이동 확인 (SC-11 A-03)
- [ ] 이미 삭제된 할일 URL 직접 접속 시 "존재하지 않는 할일입니다." 표시 후 목록으로 이동 확인 (SC-11 E-02)

---

### FE-16. 개인정보 수정 + 회원 탈퇴 UI
**설명**: 이름·비밀번호 수정(UC-04)과 회원 탈퇴(UC-14) 기능을 포함하는 프로필 페이지를 구현한다. 탈퇴 시 비밀번호 재입력 본인 확인 절차를 포함한다.  
**산출물**: `src/pages/ProfilePage.tsx`, `src/api/user.api.ts`, `src/hooks/user/useMe.ts`, `useUpdateMe.ts`, `useDeleteMe.ts`  
**의존성**: FE-07, FE-08

#### 완료 조건
- [ ] `user.api.ts`에 `getMe`, `updateMe`, `deleteMe` 함수 구현 및 반환 타입 정의 확인
- [ ] 현재 이름이 초기값으로 채워진 이름 수정 필드 및 비밀번호 변경 필드 렌더링 확인 (UC-04)
- [ ] 이름만 수정(비밀번호 필드 비워두기) 가능한 동작 확인 (SC-03 A-01)
- [ ] 현재 비밀번호 불일치 시 오류 메시지 표시 확인 (SC-03 E-01)
- [ ] 수정 성공 후 "수정이 완료되었습니다." 메시지 표시 확인
- [ ] "회원 탈퇴" 버튼 클릭 시 경고 메시지 + 비밀번호 재입력 `ConfirmDialog` 표시 확인 (SC-04 기본 흐름 2~3단계)
- [ ] 탈퇴 확인 후 `clearAuth()` 호출 + `/auth`로 이동 확인 (UC-14)
- [ ] 비밀번호 불일치 시 탈퇴 불가 오류 메시지 표시 확인 (SC-04 E-01)

---

### FE-17. 반응형 UI 점검 및 최종 통합 확인
**설명**: PC(1280px 이상)와 모바일 웹(375px~768px) 환경에서 모든 화면의 레이아웃과 주요 시나리오(SC-01~SC-11)를 브라우저에서 수동으로 검증한다.  
**산출물**: 반응형 CSS 조정 완료, 수동 QA 체크리스트 완료  
**의존성**: FE-09, FE-11, FE-13, FE-14, FE-15, FE-16

#### 완료 조건
- [ ] PC(1280px) — 모든 화면 레이아웃 깨짐 없음 확인
- [ ] 모바일(375px) — 네비게이션 바, 카드, 필터 바, 폼, 모달 세로 스크롤로 정상 사용 확인
- [ ] SC-01(회원가입) → SC-02(로그인) → SC-05(카테고리 등록 + 할일 등록) 전체 흐름 브라우저 실행 오류 없음 확인
- [ ] SC-07(카테고리 삭제 → 할일이 "일반"으로 이동) 흐름 브라우저 확인
- [ ] SC-10(필터 3개 동시 적용 + 초기화) 흐름 브라우저 확인
- [ ] SC-04(회원 탈퇴 후 재로그인 불가) 흐름 브라우저 확인
- [ ] 페이지 새로고침 후 로그인 화면으로 리다이렉트 확인 (Refresh Token 메모리 저장 정책)
- [ ] Access Token 만료 시나리오 — 개발자도구에서 만료 토큰 교체 후 API 요청 시 자동 갱신 + 정상 응답 확인 (SC-02 E-02)
- [ ] 모든 CTA 버튼의 터치 영역이 모바일에서 최소 44×44px 이상 확인

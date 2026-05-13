# 프로젝트 구조 설계 원칙 - TodoListApp

**버전**: 1.0
**작성일**: 2026-05-13
**참조 문서**:
- [도메인 정의서 v1.0](./1-domain-definition.md)
- [PRD v1.1](./2-prd.md)
- [사용자 시나리오 v1.0](./3-user-scenario.md)

---

## 목차

1. [최상위 공통 원칙](#1-최상위-공통-원칙)
2. [의존성 / 레이어 원칙](#2-의존성--레이어-원칙)
3. [코드 / 네이밍 원칙](#3-코드--네이밍-원칙)
4. [테스트 / 품질 원칙](#4-테스트--품질-원칙)
5. [설정 / 보안 / 운영 원칙](#5-설정--보안--운영-원칙)
6. [백엔드 디렉토리 구조](#6-백엔드-디렉토리-구조)
7. [프론트엔드 디렉토리 구조](#7-프론트엔드-디렉토리-구조)

---

## 1. 최상위 공통 원칙

### 1-1. 관심사 분리 (Separation of Concerns)

> **왜 필요한가**: 비즈니스 로직, 데이터 접근, UI 표현이 뒤섞이면 수정 범위를 특정하기 어렵고 버그의 파급 범위가 커진다. 각 계층이 하나의 관심사만 다루도록 분리해야 변경이 국소화된다.

- 백엔드: 라우팅 / 컨트롤러 / 서비스 / 리포지토리를 물리적으로 분리된 파일로 관리한다.
- 프론트엔드: UI 렌더링 / 서버 상태 / 클라이언트 상태 / API 호출을 각각 다른 레이어에서 담당한다.
- SQL 쿼리는 반드시 Repository 파일에만 위치한다. Controller나 Service에서 `pg` Pool을 직접 호출하는 것을 금지한다.

### 1-2. 단일 책임 원칙 (Single Responsibility Principle)

> **왜 필요한가**: 하나의 파일 또는 함수가 여러 책임을 지면 변경 이유가 복수가 되어 테스트와 유지보수가 어려워진다.

- 하나의 파일은 하나의 도메인 엔티티(User, Category, Todo) 또는 하나의 기능 단위만 담당한다.
- 예: `todoService.js`는 할일(Todo) 관련 비즈니스 로직만 포함하며, 인증 로직이나 카테고리 소유권 검증을 직접 수행하지 않는다. 카테고리 소유권 검증이 필요한 경우 `categoryRepository`를 주입받아 처리한다.

### 1-3. 의존성 단방향 원칙

> **왜 필요한가**: 레이어 간 순환 의존이 발생하면 모듈을 독립적으로 테스트하거나 교체할 수 없게 된다.

- 의존성은 항상 상위 레이어 → 하위 레이어 방향으로만 흐른다.
- Repository가 Service를 참조하거나, Service가 Controller를 참조하는 것을 금지한다.

### 1-4. 코드 일관성 원칙

> **왜 필요한가**: 팀 내 혹은 시간이 지난 후에도 코드를 빠르게 읽고 기여할 수 있으려면 일관된 패턴이 전제되어야 한다.

- 동일한 작업은 동일한 방식으로 작성한다. 예: 에러 응답 형식, SQL 파라미터 바인딩 방식, TanStack Query 훅 구조 등.
- 새로운 패턴을 도입할 때는 기존 파일 전체에 소급 적용하거나, 도입 이유를 주석으로 명시한다.
- Prettier + ESLint 설정을 프로젝트 루트에 공유하고, 커밋 전 자동 포매팅을 강제한다.

---

## 2. 의존성 / 레이어 원칙

### 2-1. 백엔드 레이어 구조

```
HTTP 요청
   ↓
Router          (Express 라우터 — URL 매핑 및 미들웨어 체인 구성)
   ↓
Middleware      (인증 검증, 입력값 유효성 검사)
   ↓
Controller      (요청/응답 처리, HTTP 상태 코드 결정)
   ↓
Service         (비즈니스 로직, 도메인 규칙 실행)
   ↓
Repository      (SQL 쿼리 실행, pg Pool 사용)
   ↓
PostgreSQL 17
```

| 레이어 | 책임 | 금지 사항 |
|--------|------|----------|
| **Router** | Express 라우터에 미들웨어와 컨트롤러 함수 등록 | 비즈니스 로직 작성 금지 |
| **Middleware** | JWT 토큰 검증(`authenticate`), 입력값 유효성 검사(`validate`) | DB 직접 접근 금지 |
| **Controller** | `req`, `res` 객체 처리, Service 호출, HTTP 응답 반환 | SQL 쿼리 작성 금지, 비즈니스 로직 금지 |
| **Service** | 비즈니스 규칙 실행 (BR-02~BR-07), 트랜잭션 조율 | `req`, `res` 참조 금지, SQL 직접 작성 금지 |
| **Repository** | `pg` Pool을 통한 SQL 실행, 결과 반환 | HTTP 관련 코드 금지, 비즈니스 로직 금지 |

**도메인 규칙과 레이어 연결 예시**

- **BR-02** (소유권 검증): `todoService`에서 `todo.user_id === req.user.id`를 검증한다. Repository에서 조회한 데이터를 Service가 받아 소유권을 확인한 후 처리한다.
- **BR-04** (기본 카테고리 수정/삭제 불가): `categoryService`에서 `category.is_default === true`이면 에러를 던진다. DB 쿼리 전 Service 레이어에서 차단한다.
- **카테고리 삭제 시 할일 이동 정책**: `categoryService.deleteCategory()` 내에서 단일 트랜잭션으로 할일의 `category_id`를 "일반" 기본 카테고리 ID로 UPDATE한 후 카테고리를 DELETE한다. Repository는 두 개의 SQL 함수를 제공하고, Service가 트랜잭션을 감싼다.

### 2-2. 프론트엔드 레이어 구조

```
사용자 인터랙션
      ↓
Page            (라우트 단위 페이지 컴포넌트 — 레이아웃 조합, 훅 호출)
      ↓
Component       (재사용 가능한 UI 단위 — 표시/상호작용만 담당)
      ↓
Hook            (useQuery/useMutation 래핑, 로컬 상태 조합)
      ↓
Store / Query   (Zustand: 클라이언트 전역 상태 | TanStack Query: 서버 상태 캐싱)
      ↓
API Layer       (axios/fetch 기반 HTTP 요청 함수)
      ↓
백엔드 REST API
```

| 레이어 | 책임 | 금지 사항 |
|--------|------|----------|
| **Page** | 페이지 단위 레이아웃 조합, 데이터 훅 호출 | 직접적인 API 호출 금지 |
| **Component** | props를 받아 UI 렌더링, 이벤트 핸들러 노출 | TanStack Query / Zustand 직접 접근 금지 (훅을 통해 접근) |
| **Hook** | `useQuery`, `useMutation` 래핑, 파생 상태 계산 | JSX 반환 금지 |
| **Store (Zustand)** | 인증 상태(`user`, `accessToken`) 등 클라이언트 전역 상태 관리 | 서버 데이터 캐싱 금지 (TanStack Query 역할) |
| **Query (TanStack Query)** | 서버 데이터 fetching, 캐싱, 동기화 | 클라이언트 UI 상태 관리 금지 |
| **API Layer** | 엔드포인트별 HTTP 요청 함수, 공통 헤더/인터셉터 설정 | UI 관련 코드 금지, 상태 저장 금지 |

### 2-3. 레이어 경계 위반 금지 케이스

아래 행위는 레이어 경계를 위반하는 것으로 코드 리뷰에서 반드시 거부한다.

| 금지 케이스 | 이유 |
|-------------|------|
| Controller에서 `pool.query()` 직접 호출 | SQL이 Repository로 집중되지 않아 쿼리 재사용/테스트 불가 |
| Service에서 `req.body` 참조 | Service는 HTTP 컨텍스트를 알아서는 안 된다 |
| Repository에서 비즈니스 규칙 분기 (예: `is_default` 체크) | 비즈니스 로직은 Service 책임 |
| Component에서 `axios.get()` 직접 호출 | API Layer를 우회하면 인터셉터(토큰 갱신 등)가 동작하지 않는다 |
| Page에서 `useAuthStore`를 거치지 않고 `localStorage` 직접 읽기 | 상태 일관성이 깨진다 |
| Hook에서 JSX 반환 | Hook은 로직 단위이므로 렌더링 책임을 갖지 않는다 |

---

## 3. 코드 / 네이밍 원칙

### 3-1. 파일명 컨벤션

#### 백엔드 (Node.js + Express)

| 구분 | 컨벤션 | 예시 |
|------|--------|------|
| 라우터 | `{domain}.routes.js` | `todo.routes.js`, `category.routes.js`, `auth.routes.js` |
| 컨트롤러 | `{domain}.controller.js` | `todo.controller.js`, `user.controller.js` |
| 서비스 | `{domain}.service.js` | `todo.service.js`, `category.service.js` |
| 리포지토리 | `{domain}.repository.js` | `todo.repository.js`, `category.repository.js` |
| 미들웨어 | `{purpose}.middleware.js` | `authenticate.middleware.js`, `validate.middleware.js` |
| 유효성 검사 스키마 | `{domain}.schema.js` | `todo.schema.js`, `user.schema.js` |
| 유틸리티 | `{purpose}.util.js` | `jwt.util.js`, `hash.util.js` |
| DB 연결 | `db.js` | `db.js` |
| 진입점 | `app.js`, `server.js` | - |

#### 프론트엔드 (React 19 + TypeScript)

| 구분 | 컨벤션 | 예시 |
|------|--------|------|
| 페이지 컴포넌트 | `{Domain}Page.tsx` | `TodoListPage.tsx`, `LoginPage.tsx`, `CategoryPage.tsx` |
| UI 컴포넌트 | `{Purpose}` PascalCase `.tsx` | `TodoCard.tsx`, `CategoryBadge.tsx`, `FilterBar.tsx` |
| 커스텀 훅 | `use{Purpose}.ts` | `useTodos.ts`, `useCreateTodo.ts`, `useAuth.ts` |
| Zustand 스토어 | `use{Domain}Store.ts` | `useAuthStore.ts` |
| API 함수 파일 | `{domain}.api.ts` | `todo.api.ts`, `category.api.ts`, `auth.api.ts` |
| 타입 정의 | `{domain}.types.ts` | `todo.types.ts`, `user.types.ts` |
| 공통 타입 | `common.types.ts` | - |
| 라우터 설정 | `router.tsx` | - |
| API 클라이언트 | `apiClient.ts` | axios 인스턴스, 인터셉터 정의 |

### 3-2. 변수 · 함수 · 클래스 네이밍 규칙

#### 공통

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수, 함수 | camelCase | `todoId`, `getUserById`, `isCompleted` |
| 상수 (불변값) | UPPER_SNAKE_CASE | `JWT_SECRET`, `DEFAULT_CATEGORY_NAME` |
| 클래스 / 생성자 | PascalCase | `TodoService`, `AppError` |
| 불리언 변수 | `is` / `has` / `can` 접두사 | `isCompleted`, `isDefault`, `hasPermission` |
| 배열 변수 | 복수형 명사 | `todos`, `categories`, `userIds` |

#### 백엔드 함수 네이밍

| 레이어 | 패턴 | 예시 |
|--------|------|------|
| Controller | `{action}{Domain}` | `getTodos`, `createTodo`, `deleteTodo` |
| Service | `{action}{Domain}` | `createTodo`, `updateTodo`, `deleteCategory` |
| Repository | `find{Domain}By{Condition}`, `create{Domain}`, `update{Domain}`, `delete{Domain}` | `findTodoById`, `findTodosByUserId`, `createTodo` |

#### 프론트엔드 훅 네이밍

| 목적 | 패턴 | 예시 |
|------|------|------|
| 데이터 조회 | `use{Domains}` | `useTodos`, `useCategories` |
| 단건 조회 | `use{Domain}` | `useTodo` |
| 생성 뮤테이션 | `useCreate{Domain}` | `useCreateTodo`, `useCreateCategory` |
| 수정 뮤테이션 | `useUpdate{Domain}` | `useUpdateTodo` |
| 삭제 뮤테이션 | `useDelete{Domain}` | `useDeleteTodo`, `useDeleteCategory` |
| 인증 관련 | `useAuth`, `useLogin`, `useLogout` | - |

### 3-3. API 엔드포인트 네이밍 규칙 (REST)

리소스는 **복수 명사**, 동사 금지, 계층 관계는 경로로 표현한다.

| 기능 | 메서드 | 엔드포인트 | 관련 UC |
|------|--------|-----------|---------|
| 회원가입 | `POST` | `/api/auth/register` | UC-01 |
| 로그인 | `POST` | `/api/auth/login` | UC-02 |
| 로그아웃 | `POST` | `/api/auth/logout` | UC-03 |
| 토큰 갱신 | `POST` | `/api/auth/refresh` | - |
| 내 정보 조회 | `GET` | `/api/users/me` | UC-04 |
| 내 정보 수정 | `PATCH` | `/api/users/me` | UC-04 |
| 회원 탈퇴 | `DELETE` | `/api/users/me` | UC-14 |
| 카테고리 목록 조회 | `GET` | `/api/categories` | - |
| 카테고리 등록 | `POST` | `/api/categories` | UC-05 |
| 카테고리 수정 | `PATCH` | `/api/categories/:categoryId` | UC-06 |
| 카테고리 삭제 | `DELETE` | `/api/categories/:categoryId` | UC-07 |
| 할일 목록 조회 | `GET` | `/api/todos` | UC-12 |
| 할일 등록 | `POST` | `/api/todos` | UC-08 |
| 할일 상세 조회 | `GET` | `/api/todos/:todoId` | UC-13 |
| 할일 수정 | `PATCH` | `/api/todos/:todoId` | UC-09 |
| 할일 삭제 | `DELETE` | `/api/todos/:todoId` | UC-10 |
| 할일 완료 처리 | `PATCH` | `/api/todos/:todoId/completion` | UC-11 |

**쿼리 파라미터 (UC-12 필터링)**

```
GET /api/todos?categoryId=3&isCompleted=false&dueDateFrom=2026-05-13&dueDateTo=2026-05-31
```

**규칙 요약**

- 경로는 소문자 + kebab-case 사용 (예: `/api/todos/:todoId/completion`)
- 리소스 식별자는 `:resourceId` 형식 (예: `:todoId`, `:categoryId`)
- 상태 변경은 별도 서브리소스로 표현 (예: `/completion`)
- 전체 교체는 `PUT`, 부분 수정은 `PATCH` 사용

### 3-4. 컴포넌트 · 훅 · 스토어 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 페이지 컴포넌트 | `{Domain}Page` | `TodoListPage`, `LoginPage` |
| 컨테이너 컴포넌트 | `{Domain}Container` | `TodoListContainer` |
| 표시 전용 컴포넌트 | 역할을 나타내는 명사 | `TodoCard`, `CategoryBadge`, `FilterBar`, `TodoForm` |
| 모달 컴포넌트 | `{Purpose}Modal` | `DeleteConfirmModal`, `TodoDetailModal` |
| Zustand 스토어 훅 | `use{Domain}Store` | `useAuthStore` |
| TanStack Query 키 | `['{domain}', ...파라미터]` 배열 | `['todos', { categoryId }]`, `['todo', todoId]` |

---

## 4. 테스트 / 품질 원칙

### 4-1. 테스트 전략

> **왜 필요한가**: 비즈니스 규칙(소유권 검증, 기본 카테고리 보호, 할일 이동 정책 등)은 복잡한 조건 분기를 포함하며, 배포 후 회귀를 방지하려면 자동화된 테스트가 필수다.

#### 단위 테스트 (Unit Test)

- **대상**: Service 레이어의 비즈니스 로직
- **목적**: DB 없이 순수 로직 검증
- **방법**: Repository를 Jest mock 함수로 대체하여 Service 함수만 독립적으로 테스트
- **필수 커버리지 대상**:
  - `todoService`: 소유권 검증 로직 (BR-02)
  - `categoryService`: `is_default` 체크 로직 (BR-04), 삭제 시 할일 이동 로직
  - `userService`: 비밀번호 일치 검증 로직 (회원 탈퇴, 개인정보 수정)
  - 유효성 검사 스키마: 각 도메인별 입력 규칙 (PRD 3.2 기준)

#### 통합 테스트 (Integration Test)

- **대상**: Router → Controller → Service → Repository → 실제 DB (테스트 DB)
- **목적**: API 엔드포인트의 전체 흐름과 DB 연동 검증
- **방법**: `supertest`로 HTTP 요청을 시뮬레이션, 테스트 전용 PostgreSQL DB 사용
- **필수 커버리지 대상**:
  - 인증 흐름: 회원가입 → 로그인 → JWT 발급 → 보호 API 접근
  - 소유권 보호: 타인 토큰으로 할일/카테고리 접근 시 403 반환
  - 카테고리 삭제 정책: 할일이 있는 카테고리 삭제 시 할일이 "일반"으로 이동되는지 확인
  - 회원 탈퇴: 연관 데이터(Todo, 사용자 정의 Category) 전체 삭제 확인

#### E2E / 수동 테스트

- MVP 규모상 E2E 자동화 테스트는 선택 사항
- Day 3 QA 단계에서 시나리오 문서(SC-01 ~ SC-11)를 체크리스트로 사용하여 수동 검증 수행

### 4-2. 테스트 파일 위치 및 네이밍 규칙

#### 백엔드

```
src/
  services/
    todo.service.js
  __tests__/
    unit/
      todo.service.test.js       ← 서비스 단위 테스트
      category.service.test.js
    integration/
      todo.routes.test.js        ← API 통합 테스트
      auth.routes.test.js
```

- 테스트 파일은 대상 파일과 동일한 이름에 `.test.js` 접미사 사용
- 단위 / 통합 테스트는 `__tests__/unit/`, `__tests__/integration/`로 분리
- 테스트 픽스처 / 팩토리는 `__tests__/fixtures/` 디렉토리에 관리

#### 프론트엔드

```
src/
  hooks/
    useTodos.ts
    useTodos.test.ts             ← 훅 단위 테스트
  components/
    TodoCard.tsx
    TodoCard.test.tsx            ← 컴포넌트 렌더링 테스트
```

- 테스트 파일은 대상 파일과 같은 디렉토리에 위치 (co-location)
- 파일명은 `.test.ts` / `.test.tsx` 접미사 사용

### 4-3. 코드 품질 기준

#### 린트 / 포매팅

- **ESLint**: `eslint:recommended` + TypeScript 규칙 적용 (프론트엔드)
- **Prettier**: 탭 너비 2, 세미콜론 사용, 작은따옴표 기준으로 통일
- 커밋 전 `lint-staged`로 변경 파일에 대해 자동 포매팅 및 린트 검사 실행

#### 타입 안전성 (프론트엔드)

- `tsconfig.json`의 `strict: true` 옵션 활성화 필수
- `any` 타입 사용 금지. 불가피한 경우 `// eslint-disable-next-line` 주석과 이유를 명시
- API 응답 타입은 `{domain}.types.ts`에 정의하고 API 함수와 훅에서 제네릭으로 사용

```typescript
// 예: todo.types.ts
export interface Todo {
  todoId: number;
  userId: number;
  categoryId: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  createdAt: string;
}
```

#### 공통 품질 기준

- 함수 길이: 단일 함수는 50줄 이하를 목표로 한다. 초과 시 분리를 검토한다.
- 매직 넘버/문자열 금지: 상수로 분리하여 의미를 명시한다. (예: `DEFAULT_CATEGORY_NAME = '일반'`)
- 주석: "무엇을"이 아닌 "왜"를 설명한다. 자명한 코드에 불필요한 주석을 달지 않는다.

---

## 5. 설정 / 보안 / 운영 원칙

### 5-1. 환경변수 관리 원칙

> **왜 필요한가**: 시크릿(DB 비밀번호, JWT 시크릿 등)이 코드에 하드코딩되면 Git 이력에 영구 노출된다. 환경에 따라 달라지는 설정을 코드와 분리해야 배포 환경 전환이 안전하다.

**`.env` 파일 구조 (백엔드)**

```
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# bcrypt
BCRYPT_SALT_ROUNDS=10
```

**규칙**

- `.env` 파일은 `.gitignore`에 반드시 추가한다.
- `.env.example` 파일을 함께 제공하여 필요한 환경변수 목록을 문서화한다. (실제 값 제외)
- 환경변수는 `process.env`로 직접 접근하지 않고 `config/env.js` (또는 `config/env.ts`) 파일에서 한 번 읽어 유효성 검사 후 export한다.
- 클라이언트(프론트엔드)에서는 `VITE_` 접두사가 붙은 환경변수만 사용하며, 시크릿 정보는 절대 포함하지 않는다.

### 5-2. JWT 토큰 처리 원칙

> **왜 필요한가**: Access Token이 탈취되더라도 피해를 최소화하려면 만료 시간을 짧게 유지하고 Refresh Token을 안전하게 보관해야 한다. 클라이언트의 자동 갱신 흐름이 명확하지 않으면 사용자 경험이 저하된다.

**토큰 저장 위치**

| 토큰 | 저장 위치 | 이유 |
|------|-----------|------|
| Access Token (1시간) | 메모리 (Zustand store) | XSS 공격으로 localStorage의 토큰이 탈취되는 것을 방지 |
| Refresh Token (7일) | 메모리 (Zustand store) | 구현 단순화. 페이지 새로고침 시 소멸되어 재로그인 필요 |

**토큰 갱신 흐름**

```
1. API 요청 시 Authorization: Bearer {accessToken} 헤더 전송
2. 서버가 401 Unauthorized 반환 (Access Token 만료)
3. 클라이언트 axios 인터셉터가 401을 가로채어
   POST /api/auth/refresh 요청 (Zustand의 Refresh Token을 Authorization 헤더로 전송)
4. 서버가 새 Access Token 발급 및 응답
5. Zustand store의 accessToken 업데이트
6. 실패했던 원래 요청을 새 Access Token으로 재시도
7. Refresh Token도 만료된 경우 → 로그인 화면으로 리다이렉트
```

**백엔드 구현 원칙**

- Refresh Token은 클라이언트 Zustand 메모리에만 저장한다. 서버 DB에 별도 저장하지 않는다.
- 로그아웃(UC-03) 시: 클라이언트 Zustand의 Access Token 및 Refresh Token 초기화
- 회원 탈퇴(UC-14) 시: 서버에서 User, Category, Todo 트랜잭션으로 삭제 + 클라이언트 Zustand 토큰 초기화

### 5-3. API 보안 원칙

> **왜 필요한가**: 도메인 정의서 BR-02에 따라 사용자는 자신의 데이터에만 접근할 수 있어야 하며, 이를 API 레벨에서 강제하지 않으면 URL 조작만으로 타인 데이터에 접근이 가능해진다.

**인증 미들웨어 (`authenticate.middleware.js`)**

- 보호가 필요한 모든 라우트에 `authenticate` 미들웨어를 적용한다.
- 미들웨어는 `Authorization` 헤더의 Bearer 토큰을 검증하고, 유효하면 `req.user = { userId, email }`를 설정한다.
- 토큰이 없거나 유효하지 않으면 즉시 `401 Unauthorized`를 반환한다.

**소유권 검증 위치 (Service 레이어)**

```
// 올바른 예: todoService.getTodoById()
async function getTodoById(todoId, requestingUserId) {
  const todo = await todoRepository.findTodoById(todoId);
  if (!todo) throw new NotFoundError('존재하지 않는 할일입니다.');
  if (todo.user_id !== requestingUserId) throw new ForbiddenError('접근 권한이 없습니다.');
  return todo;
}
```

- 소유권 검증은 Repository에서 `WHERE user_id = ?` 조건을 추가하는 방식과, Service에서 조회 후 비교하는 방식 중 하나를 선택하되, 프로젝트 전체에서 일관되게 적용한다.
  - 권장 방식: Repository의 조회 쿼리에 `AND user_id = $2` 조건을 포함하여 DB 레벨에서 차단. 결과가 없으면 404 반환.
- 기본 카테고리 보호(BR-04): `categoryService`에서 `is_default = true`인 카테고리에 수정/삭제 요청이 오면 `403 Forbidden`을 반환한다.

**입력값 유효성 검사 미들웨어**

- 각 엔드포인트에 `validate` 미들웨어를 적용하여 `req.body`, `req.params`, `req.query`를 스키마로 검증한다.
- 유효성 검사 실패 시 `400 Bad Request`와 함께 필드별 오류 메시지를 반환한다.
- PRD 3.2의 검증 규칙을 스키마 파일(`*.schema.js`)에 구현한다.

### 5-4. 에러 처리 및 응답 형식 통일 원칙

> **왜 필요한가**: API 응답 형식이 일관되지 않으면 프론트엔드에서 에러 처리 코드가 분산되어 유지보수가 어렵고, 사용자에게 일관된 오류 메시지를 제공할 수 없다.

**성공 응답 형식**

```json
{
  "success": true,
  "data": { ... }
}
```

**에러 응답 형식**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목을 입력해 주세요.",
    "details": [
      { "field": "title", "message": "필수 입력 항목입니다." }
    ]
  }
}
```

**HTTP 상태 코드 기준**

| 상황 | 상태 코드 | 에러 코드 예시 |
|------|-----------|--------------|
| 성공 (조회) | `200 OK` | - |
| 성공 (생성) | `201 Created` | - |
| 성공 (삭제, 응답 없음) | `204 No Content` | - |
| 유효성 검사 실패 | `400 Bad Request` | `VALIDATION_ERROR` |
| 인증 필요 (토큰 없음/만료) | `401 Unauthorized` | `UNAUTHORIZED` |
| 권한 없음 (소유권 실패) | `403 Forbidden` | `FORBIDDEN` |
| 리소스 없음 | `404 Not Found` | `NOT_FOUND` |
| 중복 데이터 | `409 Conflict` | `DUPLICATE_EMAIL`, `DUPLICATE_CATEGORY` |
| 서버 오류 | `500 Internal Server Error` | `INTERNAL_ERROR` |

**에러 처리 구조**

```javascript
// AppError 커스텀 에러 클래스 (errors/AppError.js)
class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// 전역 에러 핸들러 미들웨어 (app.js 마지막에 등록)
// AppError는 정의된 statusCode와 code로 응답
// 예상치 못한 에러는 500으로 응답하되 내부 오류 내용은 노출하지 않음
```

---

## 6. 백엔드 디렉토리 구조

```
backend/
├── .env                          # 환경변수 (gitignore 대상)
├── .env.example                  # 환경변수 템플릿
├── package.json
├── server.js                     # HTTP 서버 시작점 (app.js import 후 listen)
└── src/
    ├── app.js                    # Express 앱 설정 (미들웨어, 라우터 등록)
    ├── config/
    │   ├── env.js                # 환경변수 로드 및 유효성 검사
    │   └── db.js                 # pg Pool 생성 및 export
    │
    ├── routes/
    │   ├── index.js              # 전체 라우터 취합 (/api 접두사 적용)
    │   ├── auth.routes.js        # POST /auth/register, /auth/login, /auth/logout, /auth/refresh
    │   ├── user.routes.js        # GET|PATCH|DELETE /users/me
    │   ├── category.routes.js    # GET|POST /categories, PATCH|DELETE /categories/:categoryId
    │   └── todo.routes.js        # GET|POST /todos, GET|PATCH|DELETE /todos/:todoId, PATCH /todos/:todoId/completion
    │
    ├── controllers/
    │   ├── auth.controller.js    # register, login, logout, refreshToken
    │   ├── user.controller.js    # getMe, updateMe, deleteMe
    │   ├── category.controller.js # getCategories, createCategory, updateCategory, deleteCategory
    │   └── todo.controller.js    # getTodos, createTodo, getTodoById, updateTodo, deleteTodo, toggleCompletion
    │
    ├── services/
    │   ├── auth.service.js       # 회원가입(bcrypt 암호화), 로그인 검증, JWT 발급/폐기
    │   ├── user.service.js       # 개인정보 수정(비밀번호 확인), 회원 탈퇴(트랜잭션)
    │   ├── category.service.js   # 카테고리 CRUD, is_default 보호, 삭제 시 할일 이동 트랜잭션
    │   └── todo.service.js       # 할일 CRUD, 소유권 검증(BR-02), 완료 토글, 필터 조회
    │
    ├── repositories/
    │   ├── user.repository.js    # findUserByEmail, findUserById, createUser, updateUser, deleteUser
    │   ├── category.repository.js # findCategoriesByUserId, findCategoryById, createCategory, updateCategory, deleteCategory, moveTodosToDefault
    │   ├── todo.repository.js    # findTodosByUserId(필터 지원), findTodoById, createTodo, updateTodo, deleteTodo, deleteTodosByUserId
    │   └── refreshToken.repository.js # createRefreshToken, findRefreshToken, deleteRefreshToken, deleteAllByUserId
    │
    ├── middlewares/
    │   ├── authenticate.middleware.js  # JWT 검증, req.user 설정
    │   └── validate.middleware.js      # Joi/자체 스키마 기반 요청 유효성 검사
    │
    ├── schemas/                  # 유효성 검사 스키마 (PRD 3.2 기준)
    │   ├── auth.schema.js        # 회원가입/로그인 입력 규칙
    │   ├── user.schema.js        # 개인정보 수정 입력 규칙
    │   ├── category.schema.js    # 카테고리명 입력 규칙
    │   └── todo.schema.js        # 할일 등록/수정 입력 규칙
    │
    ├── errors/
    │   └── AppError.js           # 커스텀 에러 클래스 (statusCode, code, message)
    │
    └── utils/
        ├── jwt.util.js           # signAccessToken, signRefreshToken, verifyToken
        └── hash.util.js          # hashPassword, comparePassword (bcrypt 래핑)

__tests__/
├── fixtures/
│   └── testData.js               # 테스트용 사용자/할일/카테고리 데이터 팩토리
├── unit/
│   ├── todo.service.test.js
│   ├── category.service.test.js
│   └── auth.service.test.js
└── integration/
    ├── auth.routes.test.js
    ├── todo.routes.test.js
    └── category.routes.test.js
```

**주요 디렉토리 / 파일 역할 설명**

| 경로 | 역할 |
|------|------|
| `src/config/db.js` | `pg.Pool` 인스턴스를 싱글턴으로 생성하고 export. 모든 Repository가 이 Pool을 import하여 사용 |
| `src/routes/index.js` | 모든 도메인 라우터를 `/api` 접두사 아래 취합. `app.js`에서 한 번만 등록 |
| `src/middlewares/authenticate.middleware.js` | Authorization 헤더의 Bearer 토큰 검증 후 `req.user`에 `{ userId, email }` 주입 |
| `src/services/category.service.js` | 삭제 시 트랜잭션(할일 이동 → 카테고리 삭제)을 `db.js`의 Pool 클라이언트로 직접 조율 |
| `src/services/user.service.js` | 회원 탈퇴 시 Todo → Category → refreshToken → User 순서로 삭제하는 트랜잭션 처리 |
| `src/repositories/todo.repository.js` | `findTodosByUserId`는 `categoryId`, `isCompleted`, `dueDateFrom`, `dueDateTo` 파라미터를 받아 동적 WHERE 절 생성 |
| `src/errors/AppError.js` | 모든 Service/Repository에서 예외 발생 시 이 클래스를 사용. 전역 에러 핸들러가 statusCode를 참조하여 응답 |

---

## 7. 프론트엔드 디렉토리 구조

```
frontend/
├── .env.local                    # 프론트엔드 환경변수 (VITE_ 접두사, gitignore 대상)
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.json                 # strict: true 필수
├── package.json
└── src/
    ├── main.tsx                  # React 앱 진입점 (QueryClientProvider, Router 설정)
    ├── router.tsx                # React Router 라우트 정의 (인증 보호 라우트 포함)
    │
    ├── api/
    │   ├── apiClient.ts          # axios 인스턴스 생성, 인터셉터 설정 (401 → 토큰 자동 갱신)
    │   ├── auth.api.ts           # register, login, logout, refresh API 함수
    │   ├── user.api.ts           # getMe, updateMe, deleteMe API 함수
    │   ├── category.api.ts       # getCategories, createCategory, updateCategory, deleteCategory
    │   └── todo.api.ts           # getTodos(필터 파라미터), getTodoById, createTodo, updateTodo, deleteTodo, toggleCompletion
    │
    ├── stores/
    │   └── useAuthStore.ts       # Zustand: accessToken, user 정보, setAuth, clearAuth 액션
    │
    ├── hooks/
    │   ├── auth/
    │   │   ├── useLogin.ts       # useMutation: 로그인 → setAuth 호출
    │   │   ├── useLogout.ts      # useMutation: 로그아웃 → clearAuth 호출
    │   │   └── useRegister.ts    # useMutation: 회원가입
    │   ├── user/
    │   │   ├── useMe.ts          # useQuery: 내 정보 조회
    │   │   ├── useUpdateMe.ts    # useMutation: 개인정보 수정
    │   │   └── useDeleteMe.ts    # useMutation: 회원 탈퇴
    │   ├── categories/
    │   │   ├── useCategories.ts  # useQuery: 카테고리 목록 조회
    │   │   ├── useCreateCategory.ts
    │   │   ├── useUpdateCategory.ts
    │   │   └── useDeleteCategory.ts
    │   └── todos/
    │       ├── useTodos.ts       # useQuery: 할일 목록 (필터 파라미터 포함)
    │       ├── useTodo.ts        # useQuery: 할일 단건 조회
    │       ├── useCreateTodo.ts
    │       ├── useUpdateTodo.ts
    │       ├── useDeleteTodo.ts
    │       └── useToggleTodoCompletion.ts
    │
    ├── pages/
    │   ├── AuthPage.tsx          # 로그인 / 회원가입 전환 페이지
    │   ├── TodoListPage.tsx      # 할일 목록 메인 페이지 (필터 UI 포함)
    │   ├── TodoDetailPage.tsx    # 할일 상세 페이지 (또는 모달)
    │   ├── CategoryPage.tsx      # 카테고리 관리 페이지
    │   └── ProfilePage.tsx       # 개인정보 수정 / 회원 탈퇴 페이지
    │
    ├── components/
    │   ├── layout/
    │   │   ├── AppLayout.tsx     # 공통 레이아웃 (네비게이션 바 포함)
    │   │   └── ProtectedRoute.tsx # 인증 상태 확인 후 미인증 시 /auth로 리다이렉트
    │   ├── todo/
    │   │   ├── TodoCard.tsx      # 할일 카드 컴포넌트 (완료 토글, 수정/삭제 버튼)
    │   │   ├── TodoForm.tsx      # 할일 등록/수정 폼 (제목, 카테고리, 설명, 종료예정일)
    │   │   ├── TodoList.tsx      # 할일 목록 컨테이너
    │   │   └── FilterBar.tsx     # 카테고리 / 완료 여부 / 기간 필터 UI
    │   ├── category/
    │   │   ├── CategoryList.tsx  # 카테고리 목록 (기본/사용자 정의 구분 표시)
    │   │   └── CategoryForm.tsx  # 카테고리 등록/수정 폼
    │   └── common/
    │       ├── Modal.tsx         # 범용 모달 컴포넌트
    │       ├── ConfirmDialog.tsx # 삭제/탈퇴 확인 다이얼로그
    │       ├── ErrorMessage.tsx  # 에러 메시지 표시 컴포넌트
    │       └── LoadingSpinner.tsx
    │
    └── types/
        ├── user.types.ts         # User, UpdateUserRequest 인터페이스
        ├── category.types.ts     # Category, CreateCategoryRequest 인터페이스
        ├── todo.types.ts         # Todo, CreateTodoRequest, TodoFilter 인터페이스
        └── common.types.ts       # ApiResponse<T>, ApiError 공통 타입
```

**주요 디렉토리 / 파일 역할 설명**

| 경로 | 역할 |
|------|------|
| `src/api/apiClient.ts` | axios 인스턴스에 `baseURL`, `Authorization` 헤더 자동 주입, 401 응답 시 토큰 자동 갱신 인터셉터 등록 |
| `src/stores/useAuthStore.ts` | 로그인 후 발급된 `accessToken`을 메모리에 보관. 페이지 새로고침 시 `/api/auth/refresh`를 호출하여 복원 |
| `src/components/layout/ProtectedRoute.tsx` | 인증 상태(`useAuthStore`)를 확인하여 미인증 사용자는 `AuthPage`로 리다이렉트 |
| `src/hooks/todos/useTodos.ts` | `TodoFilter` 파라미터를 TanStack Query 키에 포함시켜 필터 변경 시 자동 refetch |
| `src/types/todo.types.ts` | 도메인 정의서의 Todo 엔티티 필드를 TypeScript 인터페이스로 정의. 백엔드 응답과 1:1 매핑 |
| `src/components/common/ConfirmDialog.tsx` | SC-07(카테고리 삭제), SC-09(할일 삭제), SC-04(회원 탈퇴) 시나리오의 확인 다이얼로그를 공통 컴포넌트로 재사용 |
| `src/components/category/CategoryList.tsx` | `is_default` 속성으로 기본 카테고리와 사용자 정의 카테고리를 구분하여 수정/삭제 버튼 노출 여부를 제어 (BR-04) |

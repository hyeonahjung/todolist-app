# 기술 아키텍처 다이어그램 - TodoListApp

**버전**: 1.1
**작성일**: 2026-05-13
**참조 문서**:
- [프로젝트 구조 설계 원칙 v1.0](./4-design-principles.md)
- [도메인 정의서 v1.0](./1-domain-definition.md)

---

## 목차

1. [전체 시스템 아키텍처](#1-전체-시스템-아키텍처)
2. [백엔드 레이어 구조](#2-백엔드-레이어-구조)
3. [프론트엔드 레이어 구조](#3-프론트엔드-레이어-구조)
4. [인증 흐름](#4-인증-흐름)

---

## 1. 전체 시스템 아키텍처

사용자 인터랙션부터 데이터 저장소까지의 전체 흐름을 표현합니다. JWT 토큰 인증(Access Token + Refresh Token)을 포함한 보안 아키텍처를 시각화합니다.

```mermaid
graph LR
    User["👤 사용자<br/>PC 브라우저 / 모바일 웹"]
    
    subgraph Client["클라이언트 계층"]
        React["React 19<br/>+ TypeScript<br/>+ Zustand<br/>+ TanStack Query"]
    end
    
    subgraph Frontend["프론트엔드 레이어"]
        ApiClient["API Client<br/>axios + 인터셉터"]
    end
    
    subgraph Auth["인증 흐름"]
        ATAccess["Access Token<br/>1시간 유효<br/>메모리 저장"]
        RTRefresh["Refresh Token<br/>7일 유효<br/>Zustand 메모리"]
    end
    
    subgraph Backend["백엔드 계층"]
        Express["Node.js + Express<br/>REST API Server"]
        AuthMiddleware["Auth 미들웨어<br/>JWT 검증"]
    end
    
    subgraph Database["데이터 저장소"]
        PostgreSQL["PostgreSQL 17<br/>pg 라이브러리"]
    end
    
    User -->|상호작용| React
    React -->|HTTP 요청| ApiClient
    ApiClient -->|Access Token 포함| Express
    ApiClient -->|토큰 갱신 요청| RTRefresh
    RTRefresh -->|새 Token 발급| Express
    Express -->|토큰 검증| AuthMiddleware
    AuthMiddleware -->|인증됨| Express
    Express -->|쿼리 실행| PostgreSQL
    PostgreSQL -->|데이터 응답| Express
    Express -->|JSON 응답| ApiClient
    ApiClient -->|상태 업데이트| React
    React -->|화면 렌더링| User
```

**주요 흐름**:
- **로그인**: 사용자 인증 후 Access Token + Refresh Token 모두 Zustand 메모리에 저장
- **API 요청**: 모든 요청에 Access Token 포함
- **토큰 만료**: 401 응답 시 자동으로 Refresh Token으로 새 Access Token 획득
- **데이터 저장**: PostgreSQL에 모든 사용자 데이터(User, Category, Todo) 저장

---

## 2. 백엔드 레이어 구조

HTTP 요청부터 데이터베이스까지의 처리 파이프라인입니다. 각 계층이 단일 책임을 지며 단방향 의존성을 유지합니다.

```mermaid
graph TD
    HTTPRequest["HTTP 요청<br/>GET / POST / PATCH / DELETE"]
    
    HTTPRequest --> Router["Router<br/>라우트 매핑<br/>미들웨어 체인"]
    
    Router --> AuthMW["Middleware: Auth<br/>JWT 토큰 검증<br/>req.user 설정"]
    
    AuthMW --> ValidateMW["Middleware: Validate<br/>입력값 유효성 검사<br/>req.body/params/query"]
    
    ValidateMW --> Controller["Controller<br/>요청/응답 처리<br/>상태 코드 결정"]
    
    Controller --> Service["Service<br/>비즈니스 로직<br/>도메인 규칙 실행"]
    
    Service --> Repository["Repository<br/>SQL 쿼리 실행<br/>pg Pool 사용"]
    
    Repository --> PostgreSQL["PostgreSQL 17<br/>데이터 저장/조회"]
    
    PostgreSQL --> RepositoryResult["쿼리 결과"]
    RepositoryResult --> Repository
    
    Repository --> ServiceResult["데이터 반환"]
    ServiceResult --> Service
    
    Service --> ControllerResponse["처리 결과"]
    ControllerResponse --> Controller
    
    Controller --> HTTPResponse["HTTP 응답<br/>JSON + 상태 코드"]
    
    HTTPResponse --> Client["클라이언트"]

    style Router fill:#e1f5ff
    style AuthMW fill:#fff3e0
    style ValidateMW fill:#fff3e0
    style Controller fill:#f3e5f5
    style Service fill:#e8f5e9
    style Repository fill:#fce4ec
    style PostgreSQL fill:#eeeeee
    style HTTPRequest fill:#c8e6c9
    style Client fill:#c8e6c9
```

**레이어별 책임**:

| 계층 | 역할 | 예시 |
|------|------|------|
| **Router** | Express 라우팅, 미들웨어 체인 | `router.post('/todos', authenticate, validate, createTodo)` |
| **Middleware** | 인증/검증 | `authenticate`: JWT 검증, `validate`: 입력 스키마 검증 |
| **Controller** | HTTP 처리 | `createTodo(req, res)` → Service 호출 → 응답 반환 |
| **Service** | 비즈니스 규칙 | 소유권 검증, 트랜잭션 조율, 도메인 규칙 실행 |
| **Repository** | DB 접근 | SQL 쿼리 작성 및 실행, 결과 반환 |

**의존성 흐름**: Router → Middleware → Controller → Service → Repository → Database

---

## 3. 프론트엔드 레이어 구조

사용자 인터랙션부터 API 요청까지의 상태 관리 및 렌더링 파이프라인입니다. 관심사 분리를 통해 UI, 상태, 데이터 페칭을 명확히 분리합니다.

```mermaid
graph TD
    UserAction["👤 사용자 인터랙션<br/>클릭, 입력, 페이지 이동"]
    
    UserAction --> Page["Page<br/>라우트 단위 페이지<br/>레이아웃 조합<br/>훅 호출"]
    
    Page --> Component["Component<br/>재사용 가능 UI 단위<br/>props 받아 렌더링<br/>이벤트 핸들러 노출"]
    
    Component --> Hook["Hook<br/>useQuery / useMutation 래핑<br/>로컬 상태 조합<br/>파생 상태 계산"]
    
    Hook --> Zustand["Zustand Store<br/>클라이언트 전역 상태<br/>예: auth, user 정보"]
    Hook --> TanStackQuery["TanStack Query<br/>서버 상태 캐싱<br/>자동 refetch/동기화"]
    
    Zustand --> ApiLayer["API Layer<br/>엔드포인트별 HTTP 함수<br/>공통 헤더 / 인터셉터"]
    TanStackQuery --> ApiLayer
    
    ApiLayer --> ApiClient["axios Client<br/>401 응답 시<br/>토큰 자동 갱신"]
    
    ApiClient --> Backend["백엔드 REST API<br/>Node.js + Express"]
    
    Backend --> DBResponse["DB 응답"]
    DBResponse --> ApiClient
    
    ApiClient --> UpdateState["상태 업데이트<br/>Store / Query Cache"]
    UpdateState --> Hook
    
    Hook --> RenderData["데이터 제공"]
    RenderData --> Component
    
    Component --> Render["UI 렌더링"]
    Render --> UserView["화면 표시"]
    
    UserView --> User["👤 사용자"]

    style Page fill:#e1f5ff
    style Component fill:#f3e5f5
    style Hook fill:#e8f5e9
    style Zustand fill:#fff3e0
    style TanStackQuery fill:#fff3e0
    style ApiLayer fill:#fce4ec
    style ApiClient fill:#eeeeee
    style Backend fill:#c8e6c9
    style UserAction fill:#c8e6c9
    style User fill:#c8e6c9
```

**레이어별 책임**:

| 계층 | 역할 | 예시 |
|------|------|------|
| **Page** | 페이지 단위 레이아웃 조합 | `TodoListPage`: 필터 + 목록 + 추가 폼 조합 |
| **Component** | UI 렌더링 및 이벤트 처리 | `TodoCard`: 할일 카드 표시 + 클릭 핸들러 |
| **Hook** | 데이터 페칭 및 상태 래핑 | `useTodos`: `useQuery` + 필터 파라미터 래핑 |
| **Store (Zustand)** | 클라이언트 전역 상태 | `useAuthStore`: 로그인 상태, Access Token |
| **Query (TanStack)** | 서버 상태 캐싱 | `useTodos` 결과: 서버 데이터 캐싱 및 자동 동기화 |
| **API Layer** | HTTP 함수 모음 | `todo.api.ts`: `getTodos()`, `createTodo()` 등 |

**상태 관리 원칙**:
- **Zustand**: 인증 정보(`accessToken`, `user`) 등 클라이언트 전역 상태만 관리
- **TanStack Query**: 서버에서 조회한 모든 데이터(todos, categories 등) 캐싱 및 동기화
- **로컬 상태**: Component 또는 Hook 내 `useState`로 폼 입력값 등 관리

**의존성 흐름**: Page → Component → Hook → (Store | Query) → API Layer → Backend

---

## 4. 인증 흐름

JWT Access Token + Refresh Token 기반의 인증 시나리오를 시퀀스 다이어그램으로 표현합니다.

### 4-1. 로그인 & 토큰 발급

```mermaid
sequenceDiagram
    actor 사용자
    participant Client as React App
    participant API as Express API
    participant DB as PostgreSQL

    사용자->>Client: 이메일 + 비밀번호 입력
    Client->>API: POST /auth/login
    API->>DB: 사용자 조회
    DB-->>API: User 레코드 반환
    API->>API: bcrypt 비밀번호 검증
    API-->>Client: Access Token + Refresh Token (Body)
    Client->>Client: 두 토큰 모두 Zustand 메모리에 저장
    Client->>Client: Access Token → Zustand 메모리 저장
    Client-->>사용자: 메인 화면 이동
```

### 4-2. 인증이 필요한 API 요청

```mermaid
sequenceDiagram
    actor 사용자
    participant Client as React App
    participant Interceptor as axios 인터셉터
    participant API as Express API
    participant DB as PostgreSQL

    사용자->>Client: 할일 목록 조회 요청
    Client->>Interceptor: API 요청 발생
    Interceptor->>Interceptor: Authorization 헤더에<br/>Access Token 자동 첨부
    Interceptor->>API: GET /todos (Bearer Token)
    API->>API: Auth 미들웨어: JWT 검증
    API->>DB: 사용자 소유 할일 조회 (BR-02)
    DB-->>API: Todo 목록 반환
    API-->>Client: 200 OK + JSON
    Client-->>사용자: 화면 렌더링
```

### 4-3. Access Token 만료 & 자동 갱신

```mermaid
sequenceDiagram
    actor 사용자
    participant Client as React App
    participant Interceptor as axios 인터셉터
    participant API as Express API

    사용자->>Client: API 요청 (만료된 Access Token)
    Interceptor->>API: 요청 + 만료된 Access Token
    API-->>Interceptor: 401 Unauthorized
    Interceptor->>API: POST /auth/refresh<br/>(Zustand의 Refresh Token을 Authorization 헤더로 전송)
    API->>API: Refresh Token 검증 (7일 유효)
    API-->>Interceptor: 새 Access Token 발급
    Interceptor->>Interceptor: Zustand에 새 Access Token 저장
    Interceptor->>API: 원래 요청 재시도 (새 Token)
    API-->>Client: 200 OK + 정상 응답
    Client-->>사용자: 화면 렌더링
```

### 4-4. 로그아웃

```mermaid
sequenceDiagram
    actor 사용자
    participant Client as React App
    participant API as Express API

    사용자->>Client: 로그아웃 클릭
    Client->>API: POST /auth/logout
    API->>API: 로그아웃 처리
    Client->>Client: Zustand Access Token + Refresh Token 초기화
    API-->>Client: 200 OK
    Client->>Client: Zustand Access Token 초기화
    Client-->>사용자: 로그인 화면 이동
```

---

## 아키텍처 설계 원칙

### 단방향 의존성 (Unidirectional Dependency)
- 상위 계층이 하위 계층을 의존하며, 역방향 의존은 금지
- 백엔드: Repository → Service → Controller (역방향 불가)
- 프론트엔드: Component → Hook → API Layer (역방향 불가)

### 관심사 분리 (Separation of Concerns)
- 각 계층은 하나의 책임만 담당
- Repository는 SQL만, Service는 비즈니스 로직만, Controller는 HTTP 처리만
- Component는 UI 렌더링만, Hook은 로직만, Store는 상태만

### 보안 아키텍처
- **Access Token**: 메모리 저장 (XSS 공격 방지)
- **Refresh Token**: Zustand 메모리 저장 (페이지 새로고침 시 소멸, 재로그인 필요)
- **자동 갱신**: axios 인터셉터가 401 응답을 가로채 토큰 자동 갱신
- **소유권 검증**: Service 계층에서 실행 (BR-02)

### 성능 최적화
- **TanStack Query**: 자동 캐싱, 중복 요청 제거, 백그라운드 동기화
- **Zustand**: 가벼운 상태 관리 라이브러리 (Redux 대비 번들 크기 15% 수준)
- **PostgreSQL**: 관계형 DB로 정규화된 스키마, 쿼리 최적화 가능

### 개발 경험 (DX)
- **TypeScript**: 타입 안전성으로 런타임 에러 감소
- **일관된 네이밍**: 파일명/함수명 컨벤션으로 코드 가독성 향상
- **에러 처리 통일**: 커스텀 `AppError` 클래스로 일관된 응답 형식

---

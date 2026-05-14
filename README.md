# TodoListApp

할일(Todo)을 관리하는 웹 애플리케이션입니다.  
백엔드는 Node.js + Express (JavaScript), 프론트엔드는 React 19 + TypeScript로 구성됩니다.

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | Node.js, Express, JavaScript (ES2022+) |
| 프론트엔드 | React 19, TypeScript, Zustand, TanStack Query |
| 데이터베이스 | PostgreSQL 17 (로컬 직접 설치) |
| DB 연동 | pg 라이브러리 |

---

## 로컬 개발 환경 설정

### 사전 요구사항

- Node.js 20+
- PostgreSQL 17 (로컬 설치, `C:\Program Files\PostgreSQL\17\`)

### 1. 저장소 클론 및 패키지 설치

```bash
git clone <repository-url>
cd todolist-app
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env`를 생성하고, 실제 값을 입력합니다.

```bash
cp .env.example .env
```

`.env` 파일 내용:

```
POSTGRES_CONNECTION_STRING=postgresql://postgres:{비밀번호}@localhost:5432/todolist
```

### 3. 데이터베이스 초기화

PostgreSQL에 `todolist` 데이터베이스가 없다면 먼저 생성합니다.

```bash
# psql 접속 후 DB 생성
psql -U postgres -c "CREATE DATABASE todolist;"
```

스키마 및 기본 데이터를 적용합니다.

```bash
npm run db:init
```

> `db:init` 스크립트는 `database/schema.sql`을 실행합니다.  
> 멱등성이 보장되므로 재실행해도 안전합니다(`DROP TABLE IF EXISTS` 포함).

실행 결과로 아래 3개 테이블과 기본 카테고리 3건이 생성됩니다.

| 테이블 | 설명 |
|--------|------|
| `users` | 사용자 |
| `categories` | 카테고리 (기본: 일반·업무·개인) |
| `todos` | 할일 |

### 4. 서버 실행

```bash
# 개발 서버 (nodemon 자동 재시작)
npm run dev

# 프로덕션 서버
npm start
```

서버가 정상 기동되면 아래 로그가 출력됩니다.

```
[db] DB 연결 성공
Server running on port 3000
```

---

## 주요 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 (nodemon) |
| `npm start` | 프로덕션 서버 실행 |
| `npm run db:init` | DB 스키마 초기화 (schema.sql 실행) |

---

## 디렉토리 구조

```
todolist-app/
├── database/
│   └── schema.sql          # 테이블 DDL + 기본 카테고리 시드 데이터
├── src/
│   └── config/
│       ├── env.js           # 환경변수 로드 및 유효성 검사
│       └── db.js            # pg Pool 싱글턴
├── .env                     # 환경변수 (gitignore)
├── .env.example             # 환경변수 템플릿
└── package.json
```

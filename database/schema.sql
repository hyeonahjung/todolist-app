-- =============================================================================
-- TodoListApp - Database Schema DDL
-- 버전    : 1.0
-- 작성일  : 2026-05-13
-- 참조    : docs/6-erd.md, docs/2-prd.md
-- DBMS    : PostgreSQL 17
-- =============================================================================

-- =============================================================================
-- 0. 초기화 (재실행 시 기존 테이블 삭제)
-- =============================================================================
DROP TABLE IF EXISTS todos      CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users      CASCADE;


-- =============================================================================
-- 1. users 테이블
-- =============================================================================
CREATE TABLE users (
    user_id    BIGSERIAL    PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,          -- bcrypt 해시 저장 (평문 금지)
    name       VARCHAR(50)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users            IS '서비스 사용자';
COMMENT ON COLUMN users.email      IS '로그인 ID. RFC 5322 형식, 시스템 내 유일';
COMMENT ON COLUMN users.password   IS 'bcrypt 해시 암호화된 비밀번호 (salt rounds >= 10)';
COMMENT ON COLUMN users.name       IS '사용자 이름 (1~50자)';
COMMENT ON COLUMN users.created_at IS '계정 생성 일시';


-- =============================================================================
-- 2. categories 테이블
-- =============================================================================
CREATE TABLE categories (
    category_id BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(30)  NOT NULL,
    is_default  BOOLEAN      NOT NULL DEFAULT false,
    user_id     BIGINT       REFERENCES users(user_id) ON DELETE CASCADE
    -- user_id = NULL  → 기본 카테고리 (시스템 소유, BR-04)
    -- user_id = FK값  → 사용자 정의 카테고리 (BR-05)
);

COMMENT ON TABLE  categories             IS '할일 분류 카테고리';
COMMENT ON COLUMN categories.is_default  IS 'true = 시스템 기본 카테고리, 수정·삭제 불가 (BR-04)';
COMMENT ON COLUMN categories.user_id     IS '소유 사용자. 기본 카테고리는 NULL';

-- 사용자 정의 카테고리: 동일 사용자 내 이름 중복 불가 (BR-05)
CREATE UNIQUE INDEX uq_categories_name_user
    ON categories(name, user_id)
    WHERE user_id IS NOT NULL;

-- 기본 카테고리: 이름 전역 중복 불가
CREATE UNIQUE INDEX uq_categories_name_default
    ON categories(name)
    WHERE user_id IS NULL;


-- =============================================================================
-- 3. 기본 카테고리 시드 데이터
--    todos.category_id DEFAULT 값으로 사용할 "일반" 카테고리를 먼저 삽입한다.
--    "일반" 카테고리가 category_id = 1 이 되도록 테이블 생성 직후 즉시 삽입한다.
-- =============================================================================
INSERT INTO categories (name, is_default, user_id) VALUES
    ('일반', true, NULL),   -- category_id = 1 (todos DEFAULT 참조 대상)
    ('업무', true, NULL),
    ('개인', true, NULL);


-- =============================================================================
-- 4. todos 테이블
--    todos.category_id DEFAULT 1 → 카테고리 삭제(UC-07) 시 "일반"으로 자동 이동
-- =============================================================================
CREATE TABLE todos (
    todo_id     BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    category_id BIGINT       NOT NULL DEFAULT 1
                             REFERENCES categories(category_id) ON DELETE SET DEFAULT,
    title       VARCHAR(100) NOT NULL,
    description TEXT,                           -- NULL 허용, 최대 1,000자 (앱 레벨 검증)
    due_date    DATE,                           -- NULL 허용, 등록 시 오늘 이후 (앱 레벨 검증)
    is_completed BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  todos              IS '사용자 할일 항목';
COMMENT ON COLUMN todos.user_id      IS '소유 사용자 (BR-02). 탈퇴 시 CASCADE 삭제';
COMMENT ON COLUMN todos.category_id  IS '분류 카테고리 (BR-03). 카테고리 삭제 시 "일반"(id=1)으로 SET DEFAULT';
COMMENT ON COLUMN todos.due_date     IS '종료예정일. 등록 시 오늘 이후 날짜만 허용 (앱 레벨 검증)';
COMMENT ON COLUMN todos.is_completed IS 'false=미완료, true=완료 (UC-11 토글)';
COMMENT ON COLUMN todos.created_at   IS '등록 일시. 목록 조회 기본 정렬 기준 (내림차순)';


-- =============================================================================
-- 5. 인덱스
-- =============================================================================

-- users
CREATE INDEX idx_users_email          ON users(email);                        -- 로그인 조회

-- categories
CREATE INDEX idx_categories_user_id   ON categories(user_id);                 -- 사용자별 카테고리 목록

-- todos
CREATE INDEX idx_todos_user_id        ON todos(user_id);                      -- 사용자별 할일 목록
CREATE INDEX idx_todos_category_id    ON todos(category_id);                  -- 카테고리 필터링
CREATE INDEX idx_todos_user_completed ON todos(user_id, is_completed);        -- 완료 여부 복합 필터
CREATE INDEX idx_todos_created_at     ON todos(created_at DESC);              -- 기본 정렬 (등록일시 내림차순)

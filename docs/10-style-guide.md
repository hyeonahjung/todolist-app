# 프론트엔드 스타일 가이드 - TodoListApp

**버전**: 1.0  
**작성일**: 2026-05-14  
**참조 이미지**: Microsoft To Do 스타일 참조  
**참조 문서**: [PRD v1.1](./2-prd.md) · [설계 원칙 v1.2](./4-design-principles.md)

---

## 1. 색상 (Color Palette)

### 브랜드 색상

| 이름 | 변수 | HEX | 용도 |
|------|------|-----|------|
| Primary | `--color-primary` | `#00897B` | 헤더, 강조 버튼, 완료 체크 |
| Primary Dark | `--color-primary-dark` | `#00695C` | hover 상태 |
| Primary Light | `--color-primary-light` | `#E0F2F1` | 선택된 항목 배경 |

### 배경 색상

| 이름 | 변수 | HEX | 용도 |
|------|------|-----|------|
| App Background | `--color-bg-app` | `#E8F5E9` | 전체 앱 배경 (연한 민트 그라디언트) |
| Sidebar Background | `--color-bg-sidebar` | `#FFFFFF` | 사이드바 배경 |
| Panel Background | `--color-bg-panel` | `#F0F8FF` | 중간 패널 배경 (연한 블루화이트) |
| Card Background | `--color-bg-card` | `#FFFFFF` | 카드·모달 배경 |

### 텍스트 색상

| 이름 | 변수 | HEX | 용도 |
|------|------|-----|------|
| Text Primary | `--color-text-primary` | `#212121` | 메인 텍스트 |
| Text Secondary | `--color-text-secondary` | `#757575` | 보조 텍스트, 카운트 배지 |
| Text Disabled | `--color-text-disabled` | `#BDBDBD` | 비활성 상태 |
| Text On Primary | `--color-text-on-primary` | `#FFFFFF` | Primary 배경 위 텍스트 |

### 경계선 / 구분선

| 이름 | 변수 | HEX | 용도 |
|------|------|-----|------|
| Border Default | `--color-border` | `#E0E0E0` | 패널 구분선, 리스트 구분선 |
| Border Focus | `--color-border-focus` | `#00897B` | 포커스 링 |

### 상태 색상

| 이름 | 변수 | HEX | 용도 |
|------|------|-----|------|
| Success | `--color-success` | `#43A047` | 완료 처리 |
| Error | `--color-error` | `#E53935` | 오류 메시지 |
| Warning | `--color-warning` | `#FB8C00` | 경고 |

### CSS 변수 선언 예시

```css
:root {
  --color-primary: #00897B;
  --color-primary-dark: #00695C;
  --color-primary-light: #E0F2F1;

  --color-bg-app: #E8F5E9;
  --color-bg-sidebar: #FFFFFF;
  --color-bg-panel: #F0F8FF;
  --color-bg-card: #FFFFFF;

  --color-text-primary: #212121;
  --color-text-secondary: #757575;
  --color-text-disabled: #BDBDBD;
  --color-text-on-primary: #FFFFFF;

  --color-border: #E0E0E0;
  --color-border-focus: #00897B;

  --color-success: #43A047;
  --color-error: #E53935;
  --color-warning: #FB8C00;
}
```

---

## 2. 타이포그래피 (Typography)

### 폰트 패밀리

```css
--font-family-base: 'Pretendard', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
```

> 한국어 지원을 위해 Pretendard를 최우선으로 사용합니다.

### 폰트 크기 스케일

| 이름 | 변수 | 크기 | 용도 |
|------|------|------|------|
| XS | `--font-size-xs` | `11px` | 카운트 배지, 메타 정보 |
| SM | `--font-size-sm` | `13px` | 보조 텍스트, 라벨 |
| MD | `--font-size-md` | `15px` | 본문, 리스트 아이템 |
| LG | `--font-size-lg` | `18px` | 섹션 제목, 카테고리명 |
| XL | `--font-size-xl` | `22px` | 페이지 헤더 |
| 2XL | `--font-size-2xl` | `28px` | 강조 헤더 |

### 폰트 두께

| 이름 | 변수 | 값 | 용도 |
|------|------|-----|------|
| Regular | `--font-weight-regular` | `400` | 본문 |
| Medium | `--font-weight-medium` | `500` | 메뉴 항목, 레이블 |
| SemiBold | `--font-weight-semibold` | `600` | 섹션 제목 |
| Bold | `--font-weight-bold` | `700` | 페이지 헤더 |

### 줄 간격

```css
--line-height-tight: 1.2;   /* 헤더 */
--line-height-normal: 1.5;  /* 본문 */
--line-height-loose: 1.75;  /* 가독성 강조 영역 */
```

---

## 3. 간격 (Spacing)

8px 기반 스케일을 사용합니다.

| 이름 | 변수 | 값 | 용도 |
|------|------|-----|------|
| 1 | `--space-1` | `4px` | 아이콘·텍스트 간 미세 간격 |
| 2 | `--space-2` | `8px` | 컴포넌트 내부 좁은 간격 |
| 3 | `--space-3` | `12px` | 리스트 아이템 수직 패딩 |
| 4 | `--space-4` | `16px` | 기본 패딩, 카드 내부 여백 |
| 5 | `--space-5` | `20px` | 섹션 간 간격 |
| 6 | `--space-6` | `24px` | 패널 패딩 |
| 8 | `--space-8` | `32px` | 페이지 레벨 여백 |

---

## 4. 테두리 반경 (Border Radius)

| 이름 | 변수 | 값 | 용도 |
|------|------|-----|------|
| SM | `--radius-sm` | `6px` | 버튼, 입력 필드 |
| MD | `--radius-md` | `12px` | 카드, 패널 |
| LG | `--radius-lg` | `20px` | 모달, 플로팅 패널 |
| Full | `--radius-full` | `9999px` | 체크박스, 배지, 아바타 |

---

## 5. 그림자 (Shadow)

| 이름 | 변수 | 용도 |
|------|------|------|
| SM | `--shadow-sm` | 사이드바, 패널 구분 |
| MD | `--shadow-md` | 카드, 드롭다운 |
| LG | `--shadow-lg` | 모달, 플로팅 패널 |

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.14);
```

---

## 6. 레이아웃 (Layout)

### 전체 구조

```
┌─────────────────────────────────────────────────┐
│                  App Background                  │ ← --color-bg-app
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Sidebar  │  │  List Panel  │  │  Detail   │  │
│  │ (240px)  │  │  (flex: 1)   │  │  Panel    │  │
│  │          │  │              │  │ (320px)   │  │
│  └──────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────┘
```

### 사이드바

- 너비: `240px` (고정)
- 배경: `--color-bg-sidebar`
- 그림자: `--shadow-sm` (우측)
- 패딩: `--space-4`

### 리스트 패널 (메인 콘텐츠)

- 배경: `--color-bg-panel`
- 패딩: `--space-6`
- 최대 너비 없음 (flex 확장)

### 상세 패널 / 모달

- 너비: `320px` (고정) 또는 `Modal` 컴포넌트로 오버레이
- 배경: `--color-bg-card`
- 헤더: `--color-primary` 배경 + `--color-text-on-primary`
- 테두리 반경: `--radius-lg`
- 그림자: `--shadow-lg`

### 반응형 브레이크포인트

| 이름 | 기준 | 변화 |
|------|------|------|
| Mobile | `< 768px` | 사이드바 숨김, 하단 탭 네비게이션 |
| Tablet | `768px ~ 1024px` | 사이드바 아이콘만 표시 (60px) |
| Desktop | `≥ 1024px` | 전체 3패널 레이아웃 |

---

## 7. 컴포넌트 (Components)

### 7-1. 체크박스 (할일 완료 토글)

```
미완료: ○  — 지름 22px, 테두리 2px solid --color-border
완료:   ✓  — 지름 22px, 배경 --color-primary, 흰색 체크 아이콘
```

- hover 시 테두리 색상 → `--color-primary`
- 전환 애니메이션: `transition: all 0.15s ease`

### 7-2. 리스트 아이템 (TodoCard)

```
┌─────────────────────────────────────────────────┐
│  ○  할일 제목                        카테고리 배지 │
│     종료예정일 · 설명 미리보기              수정/삭제 │
└─────────────────────────────────────────────────┘
```

- 높이: 최소 `56px`
- 패딩: `--space-3 --space-4`
- 구분선: `1px solid --color-border` (하단)
- hover 배경: `--color-primary-light`
- 완료된 항목: 제목에 `text-decoration: line-through`, 색상 `--color-text-disabled`

### 7-3. 사이드바 메뉴 아이템

```
┌──────────────────────────────────┐
│  🏠  카테고리명                 10 │
└──────────────────────────────────┘
```

- 높이: `44px`
- 아이콘: 20px, 좌측 여백 `--space-4`
- 카운트 배지: 우측 정렬, `--font-size-xs`, `--color-text-secondary`
- 활성 상태: 배경 `--color-primary-light`, 텍스트 `--color-primary`, 좌측 `3px solid --color-primary`
- 테두리 반경: `--radius-sm`

### 7-4. 버튼

#### Primary 버튼
```css
background: var(--color-primary);
color: var(--color-text-on-primary);
border-radius: var(--radius-sm);
padding: var(--space-2) var(--space-4);
font-weight: var(--font-weight-medium);
/* hover */
background: var(--color-primary-dark);
```

#### Ghost 버튼 (아이콘 버튼)
```css
background: transparent;
color: var(--color-text-secondary);
border-radius: var(--radius-full);
padding: var(--space-2);
/* hover */
background: var(--color-primary-light);
color: var(--color-primary);
```

#### Danger 버튼 (삭제)
```css
background: var(--color-error);
color: #FFFFFF;
border-radius: var(--radius-sm);
```

### 7-5. 입력 필드

```css
border: 1px solid var(--color-border);
border-radius: var(--radius-sm);
padding: var(--space-2) var(--space-3);
font-size: var(--font-size-md);
/* focus */
border-color: var(--color-border-focus);
outline: none;
box-shadow: 0 0 0 3px var(--color-primary-light);
```

### 7-6. 카테고리 배지

```css
background: var(--color-primary-light);
color: var(--color-primary-dark);
border-radius: var(--radius-full);
padding: 2px 8px;
font-size: var(--font-size-xs);
font-weight: var(--font-weight-medium);
```

### 7-7. 헤더 패널 (상세 뷰 / 리스트 타이틀)

```
┌─────────────────────────────────┐
│  ←  🍉  Groceries         👥 2 │  ← --color-primary 배경
└─────────────────────────────────┘
```

- 배경: `--color-primary`
- 텍스트: `--color-text-on-primary`
- 높이: `56px`
- 폰트: `--font-size-xl`, `--font-weight-bold`
- 테두리 반경: `--radius-lg --radius-lg 0 0`

### 7-8. 모달 / ConfirmDialog

- 오버레이: `rgba(0, 0, 0, 0.4)` 배경
- 패널: `--color-bg-card`, `--radius-lg`, `--shadow-lg`
- 최대 너비: `400px`
- 애니메이션: `scale(0.95) → scale(1)`, `0.2s ease-out`

---

## 8. 아이콘 (Icons)

- 라이브러리: **Lucide React** (권장) 또는 **Heroicons**
- 기본 크기: `20px`
- 카테고리 아이콘: 컬러 이모지 또는 SVG 아이콘 (20~24px)
- 색상: 기본 `--color-text-secondary`, 활성 `--color-primary`

| 용도 | 아이콘 |
|------|--------|
| 검색 | `Search` |
| 추가 | `Plus` |
| 수정 | `Pencil` |
| 삭제 | `Trash2` |
| 완료 체크 | `Check` |
| 뒤로 가기 | `ChevronLeft` |
| 프로필 | `User` |
| 로그아웃 | `LogOut` |
| 카테고리 | `Tag` |
| 날짜 | `Calendar` |

---

## 9. 애니메이션 (Motion)

| 이름 | 값 | 용도 |
|------|-----|------|
| `--duration-fast` | `100ms` | 버튼 hover, 체크박스 |
| `--duration-normal` | `200ms` | 패널 전환, 모달 열기 |
| `--duration-slow` | `350ms` | 페이지 전환 |
| `--easing-default` | `ease` | 일반 전환 |
| `--easing-out` | `ease-out` | 모달 등장 |

---

## 10. 글로벌 CSS 초기화

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  background: linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all var(--duration-fast) var(--easing-default);
}

input, textarea {
  font-family: inherit;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}
```

---

## 11. 접근성 (Accessibility)

- 모든 인터랙티브 요소의 터치 영역: 최소 **44×44px**
- 체크박스·버튼에 `aria-label` 필수
- 색상만으로 상태를 구분하지 않음 (아이콘·텍스트 병행)
- 포커스 링: `box-shadow: 0 0 0 3px var(--color-primary-light)` (outline 대체)
- 완료된 할일: `aria-checked="true"` + 취소선 텍스트 병행

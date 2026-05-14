#!/bin/bash
BASE="http://localhost:3000/api"
TS=$(date +%s%N | cut -c1-13)
EMAIL="curl_${TS}@example.com"
EMAIL_DEL="del_${TS}@example.com"
PW="Pass1234"
PW_NEW="NewPass5678"
PASS=0
FAIL=0

check() {
  local label=$1 expected=$2 actual=$3
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  [$label] HTTP $actual"
    PASS=$((PASS+1))
  else
    echo "  FAIL  [$label] expected $expected, got $actual"
    FAIL=$((FAIL+1))
  fi
}

extract() { echo "$1" | sed -n "s/.*\"$2\":\"\([^\"]*\)\".*/\1/p" | head -1; }
extract_num() { echo "$1" | sed -n "s/.*\"$2\":\([0-9]*\).*/\1/p" | head -1; }

echo ""
echo "========================================"
echo " SC-01: 신규 회원가입"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\",\"name\":\"GilDong\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "정상 회원가입" "201" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\",\"name\":\"GilDong\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "이메일 중복 -> 409" "409" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-email","password":"Pass1234","name":"test"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "이메일 형식 오류 -> 400" "400" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"ok@example.com","password":"onlyletters","name":"test"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "비밀번호 규칙 미충족 -> 400" "400" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"ok2@example.com","password":"short1","name":"test"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "비밀번호 8자 미만 -> 400" "400" "$CODE"

echo ""
echo "========================================"
echo " SC-02: 로그인 및 로그아웃"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
ACCESS_TOKEN=$(extract "$R" "accessToken")
REFRESH_TOKEN=$(extract "$R" "refreshToken")
check "정상 로그인" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"WrongPass1\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "비밀번호 불일치 -> 401" "401" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/refresh" \
  -H "Authorization: Bearer $REFRESH_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "Refresh Token 갱신 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/refresh" \
  -H "Authorization: Bearer invalid.token.abc")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "잘못된 Refresh Token -> 401" "401" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "로그아웃 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/logout")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "인증없이 로그아웃 -> 401" "401" "$CODE"

echo ""
echo "========================================"
echo " SC-03: 개인정보 수정"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "내 정보 조회 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"NewName"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "이름 수정 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"currentPassword\":\"$PW\",\"newPassword\":\"$PW_NEW\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "비밀번호 변경 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW_NEW\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
ACCESS_TOKEN=$(extract "$R" "accessToken")
REFRESH_TOKEN=$(extract "$R" "refreshToken")
check "새 비밀번호로 재로그인 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"WrongPass1","newPassword":"Another9999"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "현재 비밀번호 불일치 -> 400" "400" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/users/me")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "인증없이 내 정보 조회 -> 401" "401" "$CODE"

echo ""
echo "========================================"
echo " SC-05: 카테고리 생성 + 할일 등록"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "카테고리 목록 조회 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Exercise"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
CAT_ID=$(extract "$R" "categoryId")
check "카테고리 생성 -> 201" "201" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Exercise"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "카테고리명 중복 -> 409" "409" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/categories" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":""}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "카테고리명 빈값 -> 400" "400" "$CODE"

TOMORROW=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d 2>/dev/null || echo "2026-06-01")

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/todos" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Gym Registration\",\"categoryId\":$CAT_ID,\"description\":\"Find a nearby gym\",\"dueDate\":\"$TOMORROW\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
TODO_ID=$(extract "$R" "todoId")
check "할일 등록(사용자 카테고리) -> 201" "201" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/todos" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Work Report","categoryId":2}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
TODO_ID2=$(extract "$R" "todoId")
check "할일 등록(기본 카테고리) -> 201" "201" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/todos" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"categoryId\":$CAT_ID}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "제목 누락 -> 400" "400" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/todos" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"test","categoryId":1,"dueDate":"2020-01-01"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "과거 종료예정일 -> 400" "400" "$CODE"

echo ""
echo "========================================"
echo " SC-06: 카테고리 수정"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/categories/$CAT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Fitness"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "카테고리 이름 수정 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/categories/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"ModifyDefault"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "기본 카테고리 수정 시도 -> 403" "403" "$CODE"

echo ""
echo "========================================"
echo " SC-10: 할일 목록 조회 및 필터링"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "전체 할일 목록 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos?categoryId=$CAT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "카테고리 필터 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos?isCompleted=false" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "미완료 필터 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos?categoryId=$CAT_ID&isCompleted=false" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "복합 필터(카테고리+미완료) -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "인증없이 목록 조회 -> 401" "401" "$CODE"

echo ""
echo "========================================"
echo " SC-11: 할일 상세 조회"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos/$TODO_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "할일 상세 조회 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos/9999999" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "존재하지 않는 할일 -> 404" "404" "$CODE"

echo ""
echo "========================================"
echo " SC-08: 할일 수정 및 완료 처리"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/todos/$TODO_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Gym PT Registration","dueDate":"2026-06-01"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "할일 수정 -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/todos/$TODO_ID/completion" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "완료 토글(미완료->완료) -> 200" "200" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X PATCH "$BASE/todos/$TODO_ID/completion" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "완료 토글(완료->미완료) -> 200" "200" "$CODE"

echo ""
echo "========================================"
echo " SC-07: 카테고리 삭제 (할일 자동 이동)"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X DELETE "$BASE/categories/$CAT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "카테고리 삭제 -> 204" "204" "$CODE"

R=$(curl -s -X GET "$BASE/todos/$TODO_ID" -H "Authorization: Bearer $ACCESS_TOKEN")
MOVED_CAT=$(extract "$R" "categoryId")
if [ "$MOVED_CAT" = "1" ]; then
  echo "  PASS  [할일 기본 카테고리 자동 이동] categoryId=$MOVED_CAT"
  PASS=$((PASS+1))
else
  echo "  FAIL  [할일 이동 확인] expected categoryId=1, got '$MOVED_CAT'"
  FAIL=$((FAIL+1))
fi

R=$(curl -s -w "|HTTP:%{http_code}" -X DELETE "$BASE/categories/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "기본 카테고리 삭제 시도 -> 403" "403" "$CODE"

echo ""
echo "========================================"
echo " SC-09: 할일 삭제"
echo "========================================"

R=$(curl -s -w "|HTTP:%{http_code}" -X DELETE "$BASE/todos/$TODO_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "할일 삭제 -> 204" "204" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X GET "$BASE/todos/$TODO_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "삭제된 할일 조회 -> 404" "404" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X DELETE "$BASE/todos/$TODO_ID")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "인증없이 삭제 -> 401" "401" "$CODE"

echo ""
echo "========================================"
echo " SC-04: 회원 탈퇴"
echo "========================================"

curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_DEL\",\"password\":\"$PW\",\"name\":\"DelUser\"}" > /dev/null

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_DEL\",\"password\":\"$PW\"}")
DEL_TOKEN=$(extract "$R" "accessToken")

R=$(curl -s -w "|HTTP:%{http_code}" -X DELETE "$BASE/users/me" \
  -H "Authorization: Bearer $DEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"WrongPass1"}')
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "탈퇴 비밀번호 불일치 -> 400" "400" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X DELETE "$BASE/users/me" \
  -H "Authorization: Bearer $DEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"password\":\"$PW\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "회원 탈퇴 -> 204" "204" "$CODE"

R=$(curl -s -w "|HTTP:%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_DEL\",\"password\":\"$PW\"}")
CODE=$(echo "$R" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
check "탈퇴 계정 재로그인 시도 -> 401" "401" "$CODE"

echo ""
echo "========================================"
echo " 테스트 결과 요약"
echo "========================================"
echo "  PASS: $PASS"
echo "  FAIL: $FAIL"
echo "  합계: $((PASS+FAIL)) 건"

# 광고 DB 사이트

광고 영상이나 릴스 CTA에 사이트 주소를 연결하고, 방문자가 성함과 연락처를 남기면 `data/leads.json`에 신청 데이터가 저장되는 웹앱입니다.

## 실행

```bash
npm install
npm run build
npm start
```

접속 주소:

- 신청 페이지: `http://127.0.0.1:8787/ad/temu-0506?source=instagram&campaign=temu-0506`
- 관리자 페이지: `http://127.0.0.1:8787/admin`

## 데이터

- 신청 데이터: `data/leads.json`
- CSV 다운로드: 관리자 화면의 `엑셀 다운로드`

## 오픈채팅 링크

`.env.example`을 참고해 `.env`에 `VITE_OPEN_CHAT_URL`을 넣으면 신청 완료 후 대기방 바로가기 버튼이 표시됩니다.

## 관리자 보호

공개 주소로 열 때는 서버 실행 전에 관리자 비밀번호를 환경변수로 설정하세요.

```powershell
$env:ADMIN_USER="admin"
$env:ADMIN_PASSWORD="원하는-관리자-비밀번호"
npm start
```

관리자 보호가 켜지면 `/admin`, `/api/leads`, `/api/leads.csv` 접근 시 브라우저 기본 로그인 창이 표시됩니다.

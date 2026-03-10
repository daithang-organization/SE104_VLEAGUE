# SE104_VLEAGUE — Thống kê trạng thái dự án & Phân chia công việc

---

## Phần đã hoàn thành (MVP)

### Backend (NestJS + Prisma) — 58 API endpoints

| Module           | Endpoints | Mô tả                                                               | Trạng thái |
| ---------------- | --------- | ------------------------------------------------------------------- | ---------- |
| **Auth**         | 19        | Đăng ký, đăng nhập, OAuth (Google/Facebook), OTP, sessions, profile | Done       |
| **Teams**        | 5         | CRUD đội bóng + logo upload                                         | Done       |
| **Players**      | 6         | CRUD cầu thủ + CSV bulk import                                      | Done       |
| **Stadiums**     | 5         | CRUD sân vận động                                                   | Done       |
| **Seasons**      | 7         | CRUD mùa giải + chuyển trạng thái                                   | Done       |
| **Season Teams** | 4         | Đăng ký/duyệt/từ chối đội vào mùa giải                              | Done       |
| **Schedule**     | 3         | Tạo lịch thi đấu round-robin                                        | Done       |
| **Matches**      | 5         | CRUD trận đấu + sự kiện + trạng thái                                | Done       |
| **Standings**    | 5         | BXH, vua phá lưới, thẻ phạt, head-to-head                           | Done       |
| **Roster**       | 4         | Quản lý cầu thủ trong đội                                           | Done       |
| **Regulations**  | 5         | Quy định giải đấu theo mùa                                          | Done       |
| **Users**        | 4         | Admin quản lý người dùng                                            | Done       |
| **Upload**       | 1         | Upload ảnh                                                          | Done       |
| **Health**       | 1         | Health check                                                        | Done       |
| **Search**       | 1         | Tìm kiếm global                                                     | Done       |

### Frontend (React 19 + Ant Design) — 28+ pages

| Trang            | Route                                                      | Mô tả                                     | Trạng thái |
| ---------------- | ---------------------------------------------------------- | ----------------------------------------- | ---------- |
| Login/Register   | `/login`, `/register`                                      | Đăng nhập, đăng ký                        | Done       |
| Verify/Reset     | `/verify-email`, `/forgot-password`, `/reset-password`     | Xác thực email, quên/đặt lại mật khẩu     | Done       |
| OAuth            | `/auth/oauth-callback`                                     | OAuth callback                            | Done       |
| Dashboard        | `/`                                                        | Tổng quan thống kê                        | Done       |
| Teams            | `/teams`, `/teams/:id`                                     | Danh sách + chi tiết đội                  | Done       |
| Players          | `/players`, `/players/:id`                                 | Danh sách + chi tiết cầu thủ              | Done       |
| Stadiums         | `/stadiums`, `/stadiums/:id`                               | Danh sách + chi tiết sân                  | Done       |
| Seasons          | `/seasons`                                                 | Quản lý mùa giải                          | Done       |
| Schedule         | `/schedule`                                                | Lịch thi đấu                              | Done       |
| Matches          | `/matches`, `/matches/:id`                                 | Trận đấu + chi tiết sự kiện               | Done       |
| Standings        | `/standings`                                               | Bảng xếp hạng                             | Done       |
| Head-to-Head     | `/head-to-head`                                            | Đối đầu giữa 2 đội                        | Done       |
| Regulations      | `/regulations`                                             | Quy định giải                             | Done       |
| Reports          | `/reports`                                                 | Thống kê (top scorers, cards, team stats) | Done       |
| Users            | `/users`                                                   | Quản lý users (ADMIN)                     | Done       |
| Profile/Sessions | `/profile`, `/sessions`, `/change-password`                | Hồ sơ cá nhân                             | Done       |
| Public pages     | `/public/standings`, `/public/schedule`, `/public/results` | Trang công khai                           | Done       |

### Hạ tầng & DevOps

| Hạng mục                                                  | Trạng thái |
| --------------------------------------------------------- | ---------- |
| PostgreSQL + Prisma ORM (14 bảng)                         | Done       |
| Docker Compose (web + api + db)                           | Done       |
| GitHub Actions CI (lint, test, build)                     | Done       |
| Seed data cơ bản (5 users, 2 đội, 10 cầu thủ, 1 mùa giải) | Done       |
| i18n đa ngôn ngữ (Tiếng Anh + Tiếng Việt)                 | Done       |
| Structured logging (Pino)                                 | Done       |
| Rate limiting                                             | Done       |
| RBAC (5 roles)                                            | Done       |
| Unit tests (233+ tests) + E2E tests (13 files)            | Done       |
| Tài liệu kiến trúc, API docs, RBAC docs                   | Done       |

---

## Phần cần làm để hoàn chỉnh dự án

### A. Import/Seed dữ liệu thực tế (ưu tiên cao)

| #   | Công việc                       | Chi tiết                                                             |
| --- | ------------------------------- | -------------------------------------------------------------------- |
| A1  | Seed 14 đội V.League thực tế    | Tên, viết tắt, logo, thành phố, sân nhà                              |
| A2  | Seed sân vận động thực tế       | 14 sân (tên, địa chỉ, sức chứa, thành phố)                           |
| A3  | Seed cầu thủ thực tế            | ~300–400 cầu thủ (tên, ngày sinh, quốc tịch, vị trí, loại nội/ngoại) |
| A4  | Gán cầu thủ vào roster từng đội | Team-player assignments + số áo                                      |
| A5  | Tạo mùa giải V.League thực tế   | VD: V.League 2024-25, quy định mùa giải                              |
| A6  | Đăng ký 14 đội vào mùa giải     | Season-team registrations + approve                                  |
| A7  | Tạo lịch thi đấu (26 vòng)      | Generate schedule cho 14 đội                                         |
| A8  | Nhập kết quả trận đấu mẫu       | Ít nhất 5–10 vòng đấu đầu để test bảng xếp hạng                      |
| A9  | Nhập sự kiện trận đấu mẫu       | Bàn thắng, thẻ, thay người cho các trận đã có kết quả                |

### B. Kiểm thử đầy đủ (End-to-End Testing)

| #   | Công việc                         | Chi tiết                                                        |
| --- | --------------------------------- | --------------------------------------------------------------- |
| B1  | Test flow tạo mùa giải hoàn chỉnh | UPCOMING → IN_PROGRESS → COMPLETED                              |
| B2  | Test flow đăng ký đội             | REGISTERED → APPROVED/REJECTED                                  |
| B3  | Test flow trận đấu                | DRAFT → PUBLISHED → LOCKED → FINISHED + events + auto standings |
| B4  | Test tính đúng đắn BXH            | So khớp điểm, hiệu số, thứ hạng sau khi nhập kết quả            |
| B5  | Test quy định (regulations)       | Tuổi cầu thủ, giới hạn ngoại binh, roster size                  |
| B6  | Test RBAC đầy đủ                  | Mỗi vai trò chỉ truy cập được endpoint cho phép                 |
| B7  | Test uploaded images              | Logo đội, ảnh sân hiển thị đúng                                 |
| B8  | Test CSV import cầu thủ           | Import file CSV thực tế, kiểm tra lỗi/thành công                |
| B9  | Test public pages                 | Trang BXH, lịch thi đấu, kết quả không cần login                |
| B10 | Test responsive/UX                | Kiểm tra layout trên mobile, tablet, desktop                    |

### C. DevOps & Documentation

| #   | Công việc                                 | Chi tiết                            | Độ ưu tiên |
| --- | ----------------------------------------- | ----------------------------------- | ---------- |
| E1  | Viết script seed dữ liệu V.League thực tế | Script tự động seed full data       | Cao        |
| E2  | Cập nhật README hướng dẫn demo            | Video/hình ảnh demo, hướng dẫn chạy | TB         |
| E3  | Viết tài liệu test report                 | Báo cáo kiểm thử, test cases        | Cao        |
| E4  | Production deployment guide               | Hướng dẫn deploy lên VPS/cloud      | Thấp       |

---

## Phân chia công việc cho 2 người

> **Nguyên tắc phân chia**: Việt Hoàng tập trung vào **dữ liệu + backend + kiểm thử hệ thống**, Quang Tiến tập trung vào **kiểm thử giao diện + tài liệu**.

---

### Việt Hoàng — _Backend & Data_ (Dữ liệu + Logic + Kiểm thử BE)

#### Tuần 1: Seed dữ liệu thực tế

| STT | Task                                                                 | ID     | Ước lượng |
| --- | -------------------------------------------------------------------- | ------ | --------- |
| 1   | Nghiên cứu và thu thập dữ liệu 14 đội V.League (tên, logo, sân nhà)  | A1, A2 | 1–2 ngày  |
| 2   | Thu thập dữ liệu ~300 cầu thủ (nguồn: VPF, Wikipedia, Transfermarkt) | A3     | 2 ngày    |
| 3   | Viết script seed dữ liệu đội, sân, cầu thủ                           | E1     | 1 ngày    |
| 4   | Chạy seed + gán cầu thủ vào roster + tạo mùa giải + đăng ký đội      | A4–A6  | 1 ngày    |

#### Tuần 2: Tạo dữ liệu trận đấu + Kiểm thử nghiệp vụ

| STT | Task                                                       | ID     | Ước lượng |
| --- | ---------------------------------------------------------- | ------ | --------- |
| 5   | Generate lịch thi đấu 26 vòng + nhập kết quả 5–10 vòng đầu | A7, A8 | 1–2 ngày  |
| 6   | Nhập sự kiện trận đấu mẫu (bàn thắng, thẻ, thay người)     | A9     | 1 ngày    |
| 7   | Test flow mùa giải hoàn chỉnh + trận đấu state machine     | B1, B3 | 1 ngày    |
| 8   | Verify BXH tự động tính đúng (điểm, hiệu số, xếp hạng)     | B4     | 1 ngày    |

#### Tuần 3: Kiểm thử business rules

| STT | Task                                                     | ID     | Ước lượng |
| --- | -------------------------------------------------------- | ------ | --------- |
| 9   | Test quy định: tuổi, ngoại binh, roster size             | B5     | 1 ngày    |
| 10  | Test RBAC: mỗi role chỉ được phép truy cập đúng endpoint | B6     | 1 ngày    |
| 11  | Test CSV import cầu thủ + uploaded images                | B7, B8 | 1 ngày    |

#### Tuần 4: Hoàn thiện + Report

| STT | Task                                               | ID  | Ước lượng |
| --- | -------------------------------------------------- | --- | --------- |
| 12  | Fix bugs backend phát hiện trong quá trình test    | —   | 2 ngày    |
| 13  | Viết test report (các test case đã chạy + kết quả) | E3  | 1–2 ngày  |

---

### Quang Tiến — _Frontend QA & Docs_ (Kiểm thử FE + Tài liệu)

#### Tuần 1: Kiểm thử giao diện cơ bản

| STT | Task                                                       | ID  | Ước lượng |
| --- | ---------------------------------------------------------- | --- | --------- |
| 1   | Chạy dự án local (Docker) + làm quen codebase              | —   | 0.5 ngày  |
| 2   | Test flow đăng ký + đăng nhập + xác thực email             | B6  | 1 ngày    |
| 3   | Test flow đăng ký đội vào mùa giải (REGISTERED → APPROVED) | B2  | 1 ngày    |
| 4   | Test trang public (BXH, lịch, kết quả) không cần login     | B9  | 1 ngày    |
| 5   | Ghi chép bug list giao diện (screenshots + mô tả)          | —   | Liên tục  |

#### Tuần 2: Kiểm thử chức năng FE chuyên sâu

| STT | Task                                               | ID  | Ước lượng |
| --- | -------------------------------------------------- | --- | --------- |
| 6   | Test quản lý đội + cầu thủ (CRUD, filter, search)  | —   | 1 ngày    |
| 7   | Test quản lý trận đấu (chi tiết, timeline sự kiện) | —   | 1 ngày    |
| 8   | Test quản lý mùa giải + quy định                   | —   | 1 ngày    |
| 9   | Test responsive (mobile, tablet, desktop)          | B10 | 1 ngày    |

#### Tuần 3: Tài liệu + Demo

| STT | Task                                      | ID  | Ước lượng |
| --- | ----------------------------------------- | --- | --------- |
| 10  | Cập nhật README + screenshots demo        | E2  | 1 ngày    |
| 11  | Viết phần test report (FE) + tổng hợp lại | E3  | 1 ngày    |
| 12  | Chuẩn bị demo/trình bày dự án             | —   | 1 ngày    |

---

## Timeline tổng quan

- Tuần 1: Seed dữ liệu thực tế (Việt Hoàng) + Test cơ bản (Quang Tiến)
- Tuần 2: Tạo dữ liệu trận đấu + test nghiệp vụ (Việt Hoàng) + - Test sâu FE (Quang Tiến)
- Tuần 3: Test business rules (Việt Hoàng) + Tài liệu + demo (Quang Tiến)
- Tuần 4: Fix bugs + viết report (Việt Hoàng) + Hỗ trợ hoàn thiện (Quang Tiến)

---

## Lưu ý quan trọng

1. **Việt Hoàng cần hoàn thành seed dữ liệu (Tuần 1) trước**, vì Quang Tiến cần dữ liệu thực tế để test giao diện có ý nghĩa.

2. Cả 2 nên tạo branch riêng theo [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) và tạo PR để review trước khi merge vào `main`.

3. Task E4 (Production deployment guide) là **bonus** — chỉ làm nếu hoàn thành sớm các task ưu tiên cao.

---

## Tài khoản demo hiện có

| Email                    | Password     | Role         |
| ------------------------ | ------------ | ------------ |
| `admin@demo.local`       | `Demo@12345` | ADMIN        |
| `teammanager@demo.local` | `Demo@12345` | TEAM_MANAGER |
| `referee@demo.local`     | `Demo@12345` | REFEREE      |
| `supervisor@demo.local`  | `Demo@12345` | SUPERVISOR   |
| `public@demo.local`      | `Demo@12345` | PUBLIC       |

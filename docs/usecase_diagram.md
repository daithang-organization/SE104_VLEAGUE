# VLeague Management System — Use Case Diagram (v2)

> Cập nhật theo phản hồi review UML. Xem phiên bản cũ: `usecase_diagram.png`

---

## Sơ đồ Use Case (PlantUML)

Dán đoạn PlantUML bên dưới vào [plantuml.com/plantuml](https://www.plantuml.com/plantuml/uml) hoặc extension PlantUML trong VS Code để render ra ảnh.

```plantuml
@startuml VLeague_UseCase_v2
left to right direction
skinparam packageStyle rectangle
skinparam usecase {
  BackgroundColor #E8F4FD
  BorderColor #2196F3
  ArrowColor #333333
}
skinparam actor {
  BackgroundColor #FFFFFF
  BorderColor #333333
}

' ─── ACTORS ───
actor "User\n(base)" as User #LightGray
actor "Admin"           as Admin
actor "Team Manager"    as TM
actor "Referee"         as Referee
actor "Supervisor"      as Supervisor
actor "Public"          as Public

' ─── Actor Generalization ───
User <|-- Admin
User <|-- TM
User <|-- Referee
User <|-- Supervisor
User <|-- Public

' ─── SYSTEM BOUNDARY ───
rectangle "VLeague Management System" {

  ' ══════ Authentication ══════
  package "Authentication" {
    usecase "Đăng nhập"          as UC_Login
    usecase "Đăng ký"            as UC_Register
    usecase "Đăng xuất"          as UC_Logout
    usecase "Đổi mật khẩu"      as UC_ChangePW
    usecase "Quên mật khẩu"     as UC_ForgotPW
    usecase "OAuth\n(Google/Facebook)" as UC_OAuth
  }

  ' ══════ User Management ══════
  package "User Management" {
    usecase "Xem danh sách\nngười dùng"  as UC_ViewUsers
    usecase "Thêm người dùng"            as UC_AddUser
    usecase "Phân quyền\nngười dùng"     as UC_AssignRole
    usecase "Xóa người dùng"            as UC_DeleteUser
  }

  ' ══════ Team & Player ══════
  package "Team & Player" {
    usecase "Xem danh sách\nđội bóng"  as UC_ViewTeams
    usecase "Thêm đội bóng"            as UC_AddTeam
    usecase "Sửa đội bóng"             as UC_EditTeam
    usecase "Xóa đội bóng"             as UC_DeleteTeam
    usecase "Xem danh sách\ncầu thủ"   as UC_ViewPlayers
    usecase "Thêm cầu thủ"             as UC_AddPlayer
    usecase "Sửa cầu thủ"              as UC_EditPlayer
    usecase "Xóa cầu thủ"              as UC_DeletePlayer
    usecase "Quản lý đội hình\n(Roster)" as UC_Roster
  }

  ' ══════ Season & Regulation ══════
  package "Season & Regulation" {
    usecase "Xem mùa giải"         as UC_ViewSeason
    usecase "Thêm / Sửa mùa giải" as UC_ManageSeason
    usecase "Xóa mùa giải"        as UC_DeleteSeason
    usecase "Xem quy định"        as UC_ViewRegulation
    usecase "Cập nhật quy định"   as UC_EditRegulation
    usecase "Duyệt đăng ký\nđội tham gia" as UC_ApproveTeam
  }

  ' ══════ Stadium ══════
  package "Stadium" {
    usecase "Xem sân vận động"      as UC_ViewStadium
    usecase "Thêm / Sửa\nsân vận động" as UC_ManageStadium
    usecase "Xóa sân vận động"     as UC_DeleteStadium
  }

  ' ══════ Schedule & Match ══════
  package "Schedule & Match" {
    usecase "Xem lịch thi đấu"         as UC_ViewSchedule
    usecase "Lập lịch thi đấu"         as UC_CreateSchedule
    usecase "Xem kết quả\ntrận đấu"    as UC_ViewResult
    usecase "Ghi nhận kết quả\ntrận đấu" as UC_RecordResult
    usecase "Quản lý sự kiện\ntrận đấu" as UC_MatchEvent
  }

  ' ══════ Standings & Reports ══════
  package "Standings & Reports" {
    usecase "Xem bảng xếp hạng"           as UC_Standings
    usecase "Xem thống kê\n& báo cáo"     as UC_Stats
    usecase "Tìm kiếm"                    as UC_Search
    usecase "Gửi báo cáo\ngiám sát trận"  as UC_SupervisorReport
  }
}

' ═══════════════════════════════════════
'  ASSOCIATIONS
' ═══════════════════════════════════════

' --- Authentication (User base) ---
User --> UC_Login
User --> UC_Register
User --> UC_Logout
User --> UC_ChangePW
User --> UC_ForgotPW

' OAuth <<extend>> Đăng nhập
UC_Login <.. UC_OAuth : <<extend>>

' --- Admin ---
Admin --> UC_ViewUsers
Admin --> UC_AddUser
Admin --> UC_AssignRole
Admin --> UC_DeleteUser

Admin --> UC_AddTeam
Admin --> UC_EditTeam
Admin --> UC_DeleteTeam

Admin --> UC_ManageSeason
Admin --> UC_DeleteSeason
Admin --> UC_EditRegulation
Admin --> UC_ApproveTeam

Admin --> UC_ManageStadium
Admin --> UC_DeleteStadium

Admin --> UC_CreateSchedule
Admin --> UC_RecordResult

' --- Team Manager ---
TM --> UC_AddPlayer
TM --> UC_EditPlayer
TM --> UC_DeletePlayer
TM --> UC_Roster

' --- Referee ---
Referee --> UC_MatchEvent
Referee --> UC_RecordResult

' --- Supervisor ---
Supervisor --> UC_SupervisorReport

' --- Public (bao gồm người chưa đăng nhập) ---
Public --> UC_ViewTeams
Public --> UC_ViewPlayers
Public --> UC_ViewSeason
Public --> UC_ViewRegulation
Public --> UC_ViewStadium
Public --> UC_ViewSchedule
Public --> UC_ViewResult
Public --> UC_Standings
Public --> UC_Stats
Public --> UC_Search

' ═══════════════════════════════════════
'  INCLUDE relationships
' ═══════════════════════════════════════
UC_RecordResult ..> UC_MatchEvent : <<include>>
UC_CreateSchedule ..> UC_ViewSeason : <<include>>

@enduml
```

---

## Tóm tắt thay đổi so với v1

| #   | Vấn đề (v1)                                              | Cách sửa (v2)                                                                       |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | Public thiếu "Xem lịch thi đấu" & "Xem kết quả trận đấu" | Thêm `UC_ViewSchedule`, `UC_ViewResult` cho Public                                  |
| 2   | "Quản lý phiên đăng nhập" không phải mục tiêu nghiệp vụ  | Thay bằng `Đăng xuất`, `Đổi mật khẩu`, `Quên mật khẩu`                              |
| 3   | OAuth ngang hàng với Đăng nhập                           | Chuyển OAuth thành `<<extend>>` của Đăng nhập                                       |
| 4   | Supervisor gắn "Quản lý sân vận động" — sai vai trò      | Supervisor chỉ có "Gửi báo cáo giám sát trận"; Xem lịch/trận kế thừa từ User/Public |
| 5   | Use case quá lớn ("Quản lý đội bóng")                    | Tách CRUD: Xem / Thêm / Sửa / Xóa riêng                                             |
| 6   | Nhãn "Admin" trùng actor                                 | Đổi thành "User Management"                                                         |
| 7   | Không có actor generalization                            | Thêm actor cha `User` → kế thừa 5 actor con                                         |
| 8   | Thiếu `<<include>>` / `<<extend>>`                       | Thêm `<<extend>>` (OAuth), `<<include>>` (RecordResult → MatchEvent)                |

---

## Actor – Use Case Matrix

| Use Case                        | Public  | Team Manager | Referee | Supervisor | Admin |
| ------------------------------- | :-----: | :----------: | :-----: | :--------: | :---: |
| Đăng nhập / Đăng ký / Đăng xuất |    —    |      ✓       |    ✓    |     ✓      |   ✓   |
| Đổi / Quên mật khẩu             |    —    |      ✓       |    ✓    |     ✓      |   ✓   |
| OAuth (extend Đăng nhập)        |    —    |      ✓       |    ✓    |     ✓      |   ✓   |
| Xem đội bóng / cầu thủ          |    ✓    |      ✓       |    ✓    |     ✓      |   ✓   |
| Thêm / Sửa / Xóa đội bóng       |    —    |      —       |    —    |     —      |   ✓   |
| Thêm / Sửa / Xóa cầu thủ        |    —    |      ✓       |    —    |     —      |   ✓   |
| Quản lý đội hình (Roster)       |    —    |      ✓       |    —    |     —      |   ✓   |
| Xem mùa giải / quy định         |    ✓    |      ✓       |    ✓    |     ✓      |   ✓   |
| Thêm / Sửa / Xóa mùa giải       |    —    |      —       |    —    |     —      |   ✓   |
| Cập nhật quy định               |    —    |      —       |    —    |     —      |   ✓   |
| Duyệt đăng ký đội               |    —    |      —       |    —    |     —      |   ✓   |
| Xem / Thêm / Sửa / Xóa sân      | ✓ (xem) |      —       |    —    |     —      |   ✓   |
| Xem lịch thi đấu                |    ✓    |      ✓       |    ✓    |     ✓      |   ✓   |
| Lập lịch thi đấu                |    —    |      —       |    —    |     —      |   ✓   |
| Xem kết quả trận đấu            |    ✓    |      ✓       |    ✓    |     ✓      |   ✓   |
| Ghi nhận kết quả trận đấu       |    —    |      —       |    ✓    |     —      |   ✓   |
| Quản lý sự kiện trận đấu        |    —    |      —       |    ✓    |     —      |   ✓   |
| Xem BXH / Thống kê / Tìm kiếm   |    ✓    |      ✓       |    ✓    |     ✓      |   ✓   |
| Gửi báo cáo giám sát trận       |    —    |      —       |    —    |     ✓      |   —   |
| Quản lý người dùng (CRUD)       |    —    |      —       |    —    |     —      |   ✓   |

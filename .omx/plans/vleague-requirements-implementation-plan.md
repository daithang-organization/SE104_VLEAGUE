# Ke hoach hoan thien du an SE104 V-League theo de bai

## 1. Muc tieu

Muc tieu la dua du an hien tai tu muc "da co loi chuc nang quan ly giai dau" sang muc "bam sat day du de bai". Uu tien sua cac sai lech quy dinh co the lam cham diem, sau do bo sung cac workflow con thieu: moi doi truoc mua giai, ho so dang ky, dang ky tran dau, trong tai/giam sat, bao cao sau tran, treo gio va trao giai.

## 2. Can cu hien trang

Du an da co cac module nen tang:

- Backend NestJS/Prisma: `apps/api`.
- Frontend React/Ant Design: `apps/web`.
- Schema da co cac bang chinh: `Team` tai `apps/api/prisma/schema.prisma:154`, `Player` tai `apps/api/prisma/schema.prisma:180`, `Stadium` tai `apps/api/prisma/schema.prisma:206`, `SeasonTeam` tai `apps/api/prisma/schema.prisma:265`, `Match` tai `apps/api/prisma/schema.prisma:287`, `MatchEvent` tai `apps/api/prisma/schema.prisma:326`, `Regulation` tai `apps/api/prisma/schema.prisma:356`, `Standing` tai `apps/api/prisma/schema.prisma:372`.
- Quy dinh hien dang lech voi de bai: `MIN_ROSTER=15`, `MAX_FOREIGN_PLAYERS=3` trong `apps/api/src/regulation/regulation.service.ts:14`; seed that co `MAX_ROSTER=30` trong `apps/api/prisma/setup-vleague-2024.ts:57`.
- Xep lich hien lay `seasonTeam.findMany` tai `apps/api/src/scheduling/scheduling.service.ts:55`, cho phep toi thieu 2 doi tai `apps/api/src/scheduling/scheduling.service.ts:69`, chua rang buoc dung 10 doi da duyet.
- BXH hien sap xep them ban thang va ten doi sau diem/hieu so tai `apps/api/src/standings/standings.service.ts:168`.

## 3. Pham vi uu tien

### P0 - Sua sai lech quy dinh bat buoc

Muc tieu: cac gia tri va validation co ban phai khop de bai truoc khi them workflow moi.

Cong viec:

1. Sua regulation mac dinh:
   - `MIN_ROSTER = 16`.
   - `MAX_ROSTER = 22`.
   - `MAX_FOREIGN_PLAYERS_REGISTERED = 5`.
   - `MAX_FOREIGN_PLAYERS_ON_FIELD = 3`.
   - `MIN_PLAYER_AGE = 16`.
   - `MIN_STADIUM_CAPACITY = 10000`.
   - `PARTICIPATION_FEE_VND = 1000000000`.
2. Dong bo seed trong `apps/api/prisma/setup-vleague-2024.ts`.
3. Cap nhat validation o `apps/api/src/roster/roster.service.ts`:
   - Tong cau thu moi doi tu 16 den 22.
   - Cau thu ngoai quoc dang ky toi da 5.
   - Tuoi cau thu toi thieu 16.
4. Bo sung validation san nha:
   - Suc chua toi thieu 10.000.
   - Co truong quoc gia/nam tai Viet Nam.
   - Co truong tieu chuan sao FIFA hoac muc tieu chuan tuong duong, yeu cau >= 2.

Tieu chi chap nhan:

- Tao/dang ky doi co 15 cau thu bi tu choi; 16-22 cau thu hop le.
- Doi co 23 cau thu bi tu choi.
- Doi co 6 cau thu ngoai quoc bi tu choi.
- Cau thu duoi 16 tuoi bi tu choi.
- San co suc chua duoi 10.000 hoac khong nam tai Viet Nam bi tu choi.
- Seed va regulation mac dinh khong con gia tri trai de bai.

Kiem thu:

- Cap nhat `registration.service.spec.ts`, `roster.service.spec.ts`, `regulation.service.spec.ts`.
- Chay lai test targeted da co: `registration`, `roster`, `regulation`.

### P1 - Rang buoc danh sach 10 doi va xep lich dung de bai

Muc tieu: lich thi dau dung 10 doi, 18 luot, moi luot 5 tran, moi doi da 18 tran voi 9 san nha va 9 san khach.

Cong viec:

1. Cap nhat `apps/api/src/scheduling/scheduling.service.ts`:
   - Chi lay `SeasonTeam.status = APPROVED` hoac trang thai tuong duong duoc phep thi dau.
   - Bat buoc dung 10 doi truoc khi generate.
   - Neu khac 10 doi, tra loi loi ro: can 10 doi da duyet.
2. Them validation sau khi tao lich:
   - Tong so tran = 90.
   - Tong so vong = 18.
   - Moi vong = 5 tran.
   - Moi cap doi gap nhau 2 lan, doi san nha/san khach.
   - Moi doi 9 tran san nha, 9 tran san khach.
3. Neu frontend co nut tao lich, hien thong bao loi than thien khi chua du 10 doi duoc duyet.

Tieu chi chap nhan:

- 9 doi hoac 11 doi khong tao lich duoc.
- 10 doi APPROVED tao dung 90 tran.
- Khong co tran doi tu da voi chinh minh.
- Khong co cap doi bi thieu/du 2 luot.

Kiem thu:

- Cap nhat `scheduling.service.spec.ts`.
- Them test dem so vong/tran/san nha/san khach.

### P2 - Workflow moi doi va ho so tham du truoc mua giai

Muc tieu: phan "BTC moi 8 doi top mua truoc + 2 doi thang hang, doi phan hoi trong 2 tuan, thay the neu tu choi" duoc the hien thanh du lieu va man hinh quan ly.

Cong viec backend:

1. Bo sung schema Prisma:
   - `TeamInvitation`: season, team, sourceType (`PREVIOUS_TOP_8`, `PROMOTED`, `REPLACEMENT`), inviteDate, deadlineDate, responseStatus, responseDate, reason.
   - `TeamApplication` hoac mo rong `SeasonTeam`: trang thai ho so, ngay nop, ghi chu xet duyet.
   - Truong thong tin doi: co quan/cong ty chu quan, dia chi/nuoc cua co quan, gioi thieu doi.
   - Thong tin trang phuc: ao chinh thuc, ao du bi, mau sac/mo ta.
   - Phi tham du: so tien, ngay nop, trang thai thanh toan, ma bien lai neu can.
   - Lich giai khac dang/da tham gia: `ExternalCompetitionSchedule`.
2. Tao service/controller:
   - Tao danh sach moi ban dau theo rank mua truoc va doi thang hang.
   - Gui/ghi nhan loi moi va deadline 14 ngay.
   - Ghi nhan dong y/tu choi/qua han.
   - De xuat/thay the doi khi co doi khong tham gia.
   - Nop ho so va xet duyet ho so.
3. Bo sung validation:
   - Chi APPROVED khi du ho so, du phi, du roster, san dat chuan.

Cong viec frontend:

1. Man hinh "Moi tham du mua giai":
   - Danh sach doi duoc moi, deadline, trang thai phan hoi.
   - Tac vu gui moi, ghi nhan dong y/tu choi, moi doi thay the.
2. Man hinh "Ho so tham du":
   - Thong tin doi, chu quan, san nha, trang phuc, gioi thieu.
   - Danh sach cau thu.
   - Lich giai khac.
   - Trang thai nop phi.
   - Nut duyet/tu choi kem ly do.

Tieu chi chap nhan:

- He thong tao duoc danh sach moi ban dau gom 8 doi top truoc + 2 doi thang hang.
- Deadline mac dinh la 14 ngay sau ngay moi.
- Doi tu choi/qua han khong duoc dua vao danh sach xep lich.
- Doi thay the co the duoc moi de du 10 doi.
- Ho so thieu phi, thieu san dat chuan, thieu roster hop le hoac chu quan khong o Viet Nam khong duoc APPROVED.

Kiem thu:

- Them test service cho invitation/application.
- Them seed demo cho 10 doi hop le va 1-2 doi bi loai/thay the.

### P3 - Dang ky thi dau tung tran va treo gio

Muc tieu: truoc moi tran, moi doi nop danh sach 16 cau thu gom 11 chinh thuc + 5 du bi, chon ao thi dau, so do chien thuat; BTC kiem tra sai sot va cau thu bi treo gio.

Cong viec backend:

1. Bo sung schema:
   - `MatchTeamRegistration`: match, team, kitType (`HOME`/`AWAY`/`RESERVE` hoac `PRIMARY`/`BACKUP`), formation, status, submittedAt, reviewedAt, reviewNote.
   - `MatchLineupPlayer`: registration, player, role (`STARTER`, `SUBSTITUTE`), shirtNumber neu can, position.
   - `PlayerSuspension`: player, team, season, sourceMatch, reason, effectiveMatch, status.
2. Tao API:
   - Submit lineup truoc tran.
   - BTC review/approve/reject lineup.
   - Lay danh sach cau thu hop le cho tran.
   - Lay danh sach cau thu bi treo gio.
3. Validation:
   - Moi doi dung 16 cau thu.
   - Dung 11 starter va 5 substitute.
   - Tat ca cau thu thuoc roster doi trong mua giai.
   - Cau thu bi treo gio khong duoc dang ky.
   - Cau thu ngoai quoc tren san trong 11 starter toi da 3.
   - Formation co dinh dang hop le, vi du `4-4-2`, `4-3-3`.
4. Tu dong tinh treo gio:
   - 2 the vang trong pham vi quy dinh -> cam tran tiep theo.
   - 1 the do -> cam tran tiep theo.
   - Sau khi ap dung tran tiep theo thi cap nhat trang thai da thi hanh.

Cong viec frontend:

1. Cap nhat `apps/web/src/pages/MatchDetailPage.tsx`:
   - Tab dang ky thi dau moi doi.
   - Chon 11 chinh thuc, 5 du bi, so do, trang phuc.
   - Hien canh bao cau thu bi treo gio/ngoai quoc qua gioi han.
2. Cap nhat `apps/web/src/services/matchApi.ts` them API lineup/suspension.

Tieu chi chap nhan:

- Dang ky 15, 17, 10 starter, 6 substitute deu bi tu choi.
- 4 cau thu ngoai quoc trong doi hinh chinh bi tu choi.
- Cau thu nhan du 2 vang hoac 1 do khong xuat hien trong danh sach hop le o tran tiep theo.
- BTC co the approve/reject danh sach va ghi ly do.

Kiem thu:

- Them `match-lineup.service.spec.ts`.
- Bo sung test event -> suspension trong `match.service.spec.ts` hoac service moi.

### P4 - Trong tai, giam sat va bao cao sau tran

Muc tieu: the hien day du quy trinh truoc/sau tran: BTC cong bo trong tai + giam sat; trong tai ban bao cao ket qua; giam sat bao cao cong tac to chuc va sai sot.

Cong viec backend:

1. Bo sung schema:
   - `Official`: thong tin trong tai/giam sat, vai tro, trang thai.
   - `MatchOfficialAssignment`: match, official, role (`MAIN_REFEREE`, `ASSISTANT_REFEREE`, `FOURTH_OFFICIAL`, `SUPERVISOR`).
   - `MatchReport`: match, submittedBy, score, bestPlayerId, technicalStats JSON, note, submittedAt.
   - `DisciplineReport`: match, supervisorId, organizationRating/result, refereeIssues, playerIssues, organizerIssues, notes, sentToDisciplinaryAt.
2. Tao API:
   - Phan cong official cho tung tran.
   - Cong bo danh sach official.
   - Trong tai ban nop bao cao sau tran.
   - Giam sat nop bao cao danh gia/ky luat.
3. Lien ket bao cao trong tai voi `MatchEvent`:
   - Cau thu ghi ban.
   - The vang/the do.
   - Cau thu xuat sac nhat tran.
   - Cac thong so chuyen mon khac.

Cong viec frontend:

1. Man hinh phan cong trong tai/giam sat theo tran.
2. Form bao cao trong tai sau tran.
3. Form bao cao giam sat va danh sach loi chuyen BTC ky luat.
4. Hien cau thu xuat sac nhat trong chi tiet tran va bao cao tong ket.

Tieu chi chap nhan:

- Moi tran co the gan nhieu trong tai va 1 giam sat.
- Trang thai cong bo official hien tren chi tiet tran.
- Bao cao trong tai cap nhat ty so, ban thang, the phat, cau thu xuat sac nhat.
- Bao cao giam sat ghi nhan sai sot cua trong tai/cau thu/BTC san.
- Cac bao cao co timestamp va nguoi nop.

Kiem thu:

- Them test assignment/report service.
- Test bao cao sau tran cap nhat du lieu standings/top scorers/cards/POTM.

### P5 - BXH, thong ke va giai thuong cuoi mua

Muc tieu: BXH trong mua va cuoi mua dung quy dinh; cac bang thong ke phu duoc dung de trao giai.

Cong viec:

1. Cap nhat `apps/api/src/standings/standings.service.ts`:
   - Trong mua: chi xet diem va hieu so; neu bang nhau thi cho dong hang.
   - Cuoi mua: diem -> hieu so -> tong ty so doi dau 2 luot -> rut tham.
   - Bo viec uu tien `goalsFor` va ten doi cho logic chinh, tru khi chi dung de sap xep hien thi phu.
2. Bo sung API tinh BXH theo thoi diem:
   - `mode=in_progress` hoac `mode=final`.
   - Neu final van bang sau doi dau, danh dau `requiresDrawLot = true`.
3. Bo sung thong ke:
   - Vua pha luoi da co nen can kiem tra nguon event GOAL.
   - Bang so lan cau thu xuat sac nhat tran.
   - Danh sach the vang/the do.
   - Danh sach treo gio lien ket P3.
4. Bo sung module/endpoint giai thuong cuoi mua:
   - Vo dich, a quan, hang muc theo BXH.
   - Vua pha luoi.
   - Cau thu xuat sac nhat theo so lan POTM hoac quy dinh noi bo.

Tieu chi chap nhan:

- Trong mua, 2 doi bang diem va hieu so co cung hang.
- Cuoi mua, 2 doi bang diem/hieu so duoc phan hang bang doi dau neu co ket qua.
- Neu doi dau van bang, API tra co yeu cau rut tham thay vi tu sap xep theo ten.
- Bang top scorers, POTM, cards lay du lieu tu match reports/events.

Kiem thu:

- Cap nhat `standings.service.spec.ts`.
- Them test in-season tied rank.
- Them test final head-to-head.
- Them test draw-lot required.

### P6 - Hoan thien UI demo, seed va tai lieu nop bai

Muc tieu: de giang vien/nguoi cham co the thao tac theo dung kich ban de bai.

Cong viec:

1. Seed demo:
   - 10 doi hop le.
   - San nha dat/khong dat chuan.
   - Cau thu noi/ngoai quoc de test gioi han.
   - Loi moi ban dau va doi thay the.
   - Lich thi dau 18 vong.
   - Mot so tran da co event/report.
2. UI luong demo:
   - Menu Truoc mua giai: loi moi, ho so, duyet tham du.
   - Menu Mua giai: lich, chi tiet tran, lineup, official, report.
   - Menu Thong ke: BXH, vua pha luoi, POTM, the phat, treo gio, giai thuong.
3. Tai lieu:
   - Checklist mapping de bai -> chuc nang -> file/module.
   - Huong dan demo 5-10 phut.
   - Danh sach phan chua lam neu pham vi thoi gian bi cat giam.

Tieu chi chap nhan:

- Chay seed xong co du du lieu de demo tat ca muc chinh cua de bai.
- Frontend co du entry point de thao tac cac workflow quan trong.
- README hoac file docs co bang doi chieu yeu cau.

Kiem thu:

- Chay full backend test.
- Chay lint/typecheck/build neu repo co script.
- Smoke test cac man hinh chinh tren web.

## 4. Thu tu trien khai de giam rui ro

1. P0 truoc: sua regulation/validation vi anh huong cham diem truc tiep va it phu thuoc.
2. P1 tiep theo: xep lich dung 10 doi/18 vong la loi nghiep vu trung tam.
3. P5 ranking co the lam song song sau P1 vi dua vao match/standings hien co.
4. P3 lineup/treo gio nen lam truoc P4 neu thoi gian han che, vi lien quan truc tiep cau thu co duoc thi dau hay khong.
5. P4 official/report bo sung day du quy trinh van hanh tran dau.
6. P2 invitation/application la workflow lon nhat; neu sap het thoi gian, co the lam ban MVP bang `SeasonTeam` + trang thai/ghi chu truoc, sau do tach bang day du.
7. P6 lam cuoi de dong goi demo.

## 5. Goi y cat scope neu thoi gian han che

MVP nen co:

- P0 day du.
- P1 day du.
- P3 lineup + suspension co ban.
- P5 BXH trong mua/cuoi mua + top scorers/cards/POTM.
- P4 ban toi thieu: phan cong official va bao cao sau tran.

Co the de sau neu can:

- Replacement loop moi doi hoan toan tu dong.
- Bien lai thanh toan chi tiet.
- External competition schedule chi tiet theo tung tran.
- Rut tham tu dong; chi can danh dau `requiresDrawLot`.
- Technical stats JSON chi tiet; co the luu JSON mo rong truoc.

## 6. Ruis ro va cach giam

- Schema thay doi nhieu: tach migration theo pha, moi pha co test rieng.
- Logic treo gio de sai khi lich da tao nhung tran bi doi ngay: tinh "tran tiep theo cua doi" theo schedule thay vi roundNo tuyet doi.
- BXH final doi dau de sai voi nhom hon 2 doi: de bai noi tong ty so 2 luot cua 2 doi, nen MVP co the xu ly truong hop 2 doi bang nhau; neu 3+ doi bang nhau thi can quy dinh bo sung hoac danh dau can rut tham/phan xu ly thu cong.
- UI qua rong: uu tien form va bang thao tac duoc, khong dau tu nhieu vao trang tri.

## 7. Lenh xac minh de chay sau moi pha

Targeted backend tests:

```powershell
pnpm --filter api run test -- --runInBand registration.service.spec.ts roster.service.spec.ts scheduling.service.spec.ts match.service.spec.ts standings.service.spec.ts regulation.service.spec.ts
```

Sau khi them module moi:

```powershell
pnpm --filter api run test -- --runInBand invitation.service.spec.ts match-lineup.service.spec.ts official-assignment.service.spec.ts match-report.service.spec.ts standings.service.spec.ts
```

Neu repo co scripts tuong ung:

```powershell
pnpm --filter api run lint
pnpm --filter api run build
pnpm --filter web run lint
pnpm --filter web run build
```

## 8. Dinh nghia hoan thanh

Plan duoc xem la hoan thanh khi:

- Tat ca regulation trong P0 khop de bai.
- Chi 10 doi da duyet moi duoc tao lich, lich co 18 vong/90 tran.
- Doi co the nop ho so, roster, phi, san nha va duoc BTC duyet/tu choi.
- Truoc tran co lineup 16 cau thu, so do, trang phuc, validation cau thu ngoai quoc va treo gio.
- Moi tran co official/supervisor assignment va bao cao sau tran.
- BXH, vua pha luoi, POTM, cards, suspension, awards co du lieu hien thi va test.
- Full test/build chay qua hoac co ghi chu ro phan khong chay duoc.

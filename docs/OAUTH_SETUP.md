# Hướng dẫn cấu hình OAuth (Google & Facebook)

Tài liệu này hướng dẫn cách thiết lập đăng nhập bằng Google và Facebook cho ứng dụng VLeague.

---

## 📋 Mục lục

- [Google OAuth](#google-oauth)
- [Facebook OAuth](#facebook-oauth)
- [Cấu hình .env](#cấu-hình-env)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## Google OAuth

### Bước 1: Tạo Project trên Google Cloud Console

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Đặt tên project: `VLeague` (hoặc tên bạn muốn)
4. Click **Create**

### Bước 2: Cấu hình OAuth Consent Screen

1. Vào menu **APIs & Services** → **OAuth consent screen**
2. Chọn **External** → Click **Create**
3. Điền thông tin bắt buộc:
   - **App name**: `VLeague`
   - **User support email**: Email của bạn
   - **Developer contact information**: Email của bạn
4. Click **Save and Continue**
5. Ở trang **Scopes**, click **Add or Remove Scopes**:
   - Chọn `.../auth/userinfo.email`
   - Chọn `.../auth/userinfo.profile`
   - Click **Update** → **Save and Continue**
6. Ở trang **Test users** (nếu app chưa publish):
   - Click **Add Users**
   - Thêm email của bạn và các tester
   - Click **Save and Continue**
7. Review và click **Back to Dashboard**

### Bước 3: Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Chọn **Application type**: `Web application`
4. Đặt tên: `VLeague Web`
5. Trong phần **Authorized redirect URIs**, click **+ ADD URI** và thêm:
   ```
   http://localhost:8080/api/auth/google/callback
   ```
   
   > ⚠️ **Production**: Thêm URL production, ví dụ:
   > ```
   > https://api.vleague.com/api/auth/google/callback
   > ```

6. Click **Create**
7. Một popup hiện ra với **Client ID** và **Client Secret** - Copy lại!

### Bước 4: Cập nhật .env

```env
GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
```

---

## Facebook OAuth

### Bước 1: Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Đăng nhập bằng tài khoản Facebook
3. Click **My Apps** (góc trên phải) → **Create App**
4. Chọn **Use cases**: 
   - Chọn **Authenticate and request data from users with Facebook Login**
   - Click **Next**
5. Chọn **App type**: `Consumer`
6. Điền thông tin:
   - **App name**: `VLeague`
   - **App contact email**: Email của bạn
7. Click **Create App**

### Bước 2: Thiết lập Facebook Login

1. Trong Dashboard của app, tìm **Facebook Login** → Click **Set up**
2. Chọn **Web**
3. Nhập **Site URL**: `http://localhost:5173` → Click **Save** → **Continue**
4. Bỏ qua các bước còn lại (Next, Next...)

### Bước 3: Cấu hình OAuth Settings

1. Vào menu bên trái: **Facebook Login** → **Settings**
2. Trong phần **Valid OAuth Redirect URIs**, thêm:
   ```
   http://localhost:8080/api/auth/facebook/callback
   ```
   
   > ⚠️ **Production**: Thêm URL production, ví dụ:
   > ```
   > https://api.vleague.com/api/auth/facebook/callback
   > ```

3. Click **Save Changes**

### Bước 4: Lấy App ID và App Secret

1. Vào **Settings** → **Basic** (menu bên trái)
2. Copy **App ID**
3. Click **Show** bên cạnh **App Secret** → Nhập mật khẩu Facebook → Copy secret

### Bước 5: Cập nhật .env

```env
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
FACEBOOK_CALLBACK_URL=http://localhost:8080/api/auth/facebook/callback
```

### Bước 6: Thêm Tester (Development Mode)

> ⚠️ **Quan trọng**: Khi app ở Development Mode, chỉ có Admins và Testers mới có thể đăng nhập!

1. Vào **App Roles** → **Roles**
2. Click **Add Testers**
3. Nhập Facebook ID hoặc username của người muốn test
4. Người được mời cần vào [Facebook Apps](https://www.facebook.com/settings?tab=business_tools) để accept lời mời

### Bước 7: (Tùy chọn) Publish App

Để cho phép tất cả người dùng đăng nhập:

1. Vào **App Review** → **Requests**
2. Submit app để review (cần Privacy Policy URL, Terms of Service URL)
3. Sau khi approved, vào **Settings** → **Basic** → Toggle **App Mode** sang **Live**

---

## Cấu hình .env

File `.env` hoàn chỉnh cho OAuth:

```env
# ===========================================
# GOOGLE OAUTH CONFIGURATION
# ===========================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback

# ===========================================
# FACEBOOK OAUTH CONFIGURATION
# ===========================================
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:8080/api/auth/facebook/callback

# ===========================================
# FRONTEND URL (cho OAuth redirect)
# ===========================================
FRONTEND_URL=http://localhost:5173
```

---

## Xử lý lỗi thường gặp

### Google OAuth

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| `Error 401: invalid_client` | Client ID/Secret sai hoặc chưa cấu hình | Kiểm tra lại GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong .env |
| `Error 400: redirect_uri_mismatch` | Redirect URI không khớp | Thêm đúng URL `http://localhost:8080/api/auth/google/callback` vào Authorized redirect URIs |
| `Access blocked: App not verified` | App chưa được verify | Thêm email vào Test users hoặc submit app để review |

### Facebook OAuth

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| `App Not Set Up` | App chưa cấu hình đúng | Kiểm tra Facebook Login đã được thêm vào app |
| `URL Blocked` | Redirect URI không hợp lệ | Thêm URL vào Valid OAuth Redirect URIs |
| `User is not a tester` | App đang ở Development Mode | Thêm user vào Testers hoặc publish app |
| `Can't Load URL` | Domain không được phép | Thêm domain vào App Domains trong Settings → Basic |

### Lỗi chung

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| Redirect về login page | Token không được lưu | Kiểm tra FRONTEND_URL trong .env |
| CORS error | Frontend và Backend khác domain | Kiểm tra CORS config trong main.ts |
| `Cannot GET /auth/oauth-callback` | Route chưa được cấu hình | Kiểm tra App.tsx có route `/auth/oauth-callback` |

---

## Kiểm tra hoạt động

1. **Khởi động API server**:
   ```bash
   cd apps/api
   pnpm dev
   ```

2. **Khởi động Web**:
   ```bash
   cd apps/web
   pnpm dev
   ```

3. **Truy cập**: http://localhost:5173/login

4. **Click** nút "Đăng nhập với Google" hoặc "Đăng nhập với Facebook"

5. **Đăng nhập** với tài khoản Google/Facebook

6. **Kiểm tra** được redirect về trang chủ và đã đăng nhập

---

## Tài liệu tham khảo

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Passport.js Facebook Strategy](http://www.passportjs.org/packages/passport-facebook/)

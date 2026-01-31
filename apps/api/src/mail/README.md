# Mail Module

Module xử lý gửi email trong ứng dụng V-League.

## Công nghệ sử dụng

- **@nestjs-modules/mailer**: NestJS wrapper cho Nodemailer
- **Nodemailer**: Thư viện gửi email phổ biến nhất cho Node.js
- **Handlebars**: Template engine cho email templates

## Cấu hình

Các biến môi trường cần thiết:

```env
# SMTP Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@vleague.local
```

### Sử dụng với Gmail

1. Bật 2FA cho tài khoản Gmail
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Sử dụng App Password làm `MAIL_PASS`

### Sử dụng với các SMTP providers khác

**SendGrid:**
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=postmaster@your-domain.mailgun.org
MAIL_PASS=your-mailgun-password
```

**Amazon SES:**
```env
MAIL_HOST=email-smtp.us-east-1.amazonaws.com
MAIL_PORT=587
MAIL_USER=your-ses-access-key
MAIL_PASS=your-ses-secret-key
```

## Email Templates

Templates được đặt trong thư mục `templates/`:

- `email-verification.hbs`: Template xác thực email
- `password-reset.hbs`: Template đặt lại mật khẩu
- `welcome.hbs`: Template chào mừng

## Sử dụng

```typescript
import { MailService } from './mail';

@Injectable()
export class AuthService {
  constructor(private readonly mail: MailService) {}

  async sendOtp() {
    await this.mail.sendEmailVerificationOtp('user@example.com', '123456');
  }
}
```

## Development

Để test email trong môi trường development, có thể sử dụng:

- **Mailtrap**: https://mailtrap.io - SMTP testing server
- **Ethereal**: https://ethereal.email - Fake SMTP service (miễn phí)

```env
# Mailtrap configuration
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-user
MAIL_PASS=your-mailtrap-pass
```

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly skipMail: boolean;

  constructor(private readonly mailer: MailerService) {
    // Skip gửi mail thật trong dev mode nếu MAIL_SKIP_SEND=true
    this.skipMail = process.env.MAIL_SKIP_SEND === 'true';
    if (this.skipMail) {
      this.logger.warn(
        '📧 Mail sending is DISABLED - OTP will be logged to console',
      );
    }
  }

  /**
   * Gửi OTP xác thực email khi đăng ký
   */
  async sendEmailVerificationOtp(email: string, otp: string): Promise<void> {
    if (this.skipMail) {
      this.logger.warn(`🔑 [DEV] Email Verification OTP for ${email}: ${otp}`);
      return;
    }

    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'V-League - Xác thực email của bạn',
        template: 'email-verification',
        context: {
          otp,
          expiresIn: '10 phút',
        },
      });
      this.logger.log(`Email verification OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email verification OTP to ${email}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gửi OTP đặt lại mật khẩu
   */
  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    if (this.skipMail) {
      this.logger.warn(`🔑 [DEV] Password Reset OTP for ${email}: ${otp}`);
      return;
    }

    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'V-League - Đặt lại mật khẩu',
        template: 'password-reset',
        context: {
          otp,
          expiresIn: '10 phút',
        },
      });
      this.logger.log(`Password reset OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset OTP to ${email}`, error);
      throw error;
    }
  }

  /**
   * Gửi email chào mừng sau khi xác thực thành công
   */
  async sendWelcomeEmail(email: string): Promise<void> {
    if (this.skipMail) {
      this.logger.debug(`[DEV] Skipped welcome email for ${email}`);
      return;
    }

    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'V-League - Chào mừng bạn!',
        template: 'welcome',
        context: {
          email,
        },
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
      // Không throw error vì đây chỉ là email chào mừng
    }
  }
}

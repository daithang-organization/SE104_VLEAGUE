import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: MailerService) {}

  /**
   * Gửi OTP xác thực email khi đăng ký
   */
  async sendEmailVerificationOtp(email: string, otp: string): Promise<void> {
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

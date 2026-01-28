import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RegistrationModule } from './registration/registration.module';

@Module({
  imports: [PrismaModule, RegistrationModule],
})
export class AppModule {}

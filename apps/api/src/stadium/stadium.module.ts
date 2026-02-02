import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StadiumController } from './stadium.controller';
import { StadiumService } from './stadium.service';

@Module({
  imports: [PrismaModule],
  controllers: [StadiumController],
  providers: [StadiumService],
  exports: [StadiumService],
})
export class StadiumModule {}

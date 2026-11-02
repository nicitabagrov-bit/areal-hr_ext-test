import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- ДОБАВИТЬ
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { PositionsModule } from './positions/positions.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // <-- ДОБАВИТЬ
    DatabaseModule,
    OrganizationsModule,
    DepartmentsModule,
    PositionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
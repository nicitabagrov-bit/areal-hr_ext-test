import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database.module.js';

// Твои модули
import { AuthModule } from './auth/auth.module.js';
import { EmployeesModule } from './employees/employees.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { DepartmentsModule } from './departments/departments.module.js';
import { PositionsModule } from './positions/positions.module.js';
import { FilesModule } from './files/files.module.js';
import { FileCategoriesModule } from './file-categories/file-categories.module.js';
import { HrOperationsModule } from './hr-operations/hr-operations.module.js';
import { ChangeHistoryModule } from './change-history/change-history.module.js';
import { AddressesModule } from './addresses/addresses.module.js';
import { PassportsModule } from './passports/passports.module.js';

// Модуль пользователей
import { UsersModule } from './users/users.module.js';

// Модуль ролей
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,

    // Твои модули
    AuthModule,
    EmployeesModule,
    OrganizationsModule,
    DepartmentsModule,
    PositionsModule,
    FilesModule,
    FileCategoriesModule,
    HrOperationsModule,
    ChangeHistoryModule,
    AddressesModule,
    PassportsModule,

    // Подключаем модуль пользователей
    UsersModule,

    // Подключаем модуль ролей
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

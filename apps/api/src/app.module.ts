import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module.js';
import { TodoModule } from './todo/todo.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PluginModule } from './plugin/plugin.module.js';
import { CvaBackendPlugin } from '@rahataid/plugin-project-cva/backend';

@Module({
  imports: [
    PrismaModule,
    TodoModule,
    PluginModule.register([CvaBackendPlugin]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

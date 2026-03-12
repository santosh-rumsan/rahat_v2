import { DynamicModule, Module } from '@nestjs/common'
import type { ProjectBackendPlugin } from '@rahataid/plugin-sdk'
import {
  PluginRegistryService,
  REGISTERED_PLUGINS,
} from './plugin-registry.service.js'
import { ProjectTypeController } from './project-type.controller.js'

@Module({})
export class PluginModule {
  static register(plugins: ProjectBackendPlugin[]): DynamicModule {
    return {
      module: PluginModule,
      imports: plugins.map((p) => p.module as any),
      controllers: [ProjectTypeController],
      providers: [
        { provide: REGISTERED_PLUGINS, useValue: plugins },
        PluginRegistryService,
      ],
      exports: [PluginRegistryService],
      global: true,
    }
  }
}

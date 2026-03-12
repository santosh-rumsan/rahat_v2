import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { PluginRegistryService } from './plugin-registry.service.js'

@ApiTags('project-types')
@Controller('project-types')
export class ProjectTypeController {
  constructor(private readonly registry: PluginRegistryService) {}

  @Get()
  getProjectTypes() {
    return this.registry.getProjectTypes().map((type) => ({ type }))
  }
}

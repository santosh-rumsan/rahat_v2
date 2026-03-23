import { Body, Controller, Post } from '@nestjs/common';

interface ProxyRequestDto {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

@Controller('proxy')
export class ProxyController {
  @Post()
  async forward(@Body() dto: ProxyRequestDto) {
    const { url, method = 'POST', headers = {}, body } = dto;
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: response.status, ok: response.ok, data };
  }
}

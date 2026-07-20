import { Controller, Get } from '@nestjs/common';
import { openApiDocument } from './openapi-document.js';
import type { OpenApiDocument } from './openapi.types.js';

@Controller()
export class OpenApiStaticController {
  @Get('main.json')
  serveMain(): OpenApiDocument {
    return openApiDocument;
  }
}

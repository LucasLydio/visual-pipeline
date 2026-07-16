import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';
import type { PublicUser } from './users.types.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<PublicUser> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findMany(@Query('search') search?: string): Promise<PublicUser[]> {
    return this.usersService.findMany(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PublicUser> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<PublicUser> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  disable(@Param('id') id: string): Promise<PublicUser> {
    return this.usersService.disable(id);
  }
}

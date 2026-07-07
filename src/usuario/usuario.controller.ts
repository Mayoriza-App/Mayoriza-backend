import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AssignEmpresaDto } from './dto/assign-empresa.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { UsuarioService } from './usuario.service';

/**
 * Controller to manage Usuario resources.
 * Protected by JwtAuthGuard as part of BFF security.
 */
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  /**
   * Retrieves a list of all user profiles.
   * @returns Array of UsuarioResponseDto
   */
  @Get()
  async findAll(): Promise<UsuarioResponseDto[]> {
    return this.usuarioService.findAll();
  }

  /**
   * Retrieves a single user profile by UUID.
   * @param id The UUID of the user
   * @returns UsuarioResponseDto
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsuarioResponseDto> {
    return this.usuarioService.findOne(id);
  }

  /**
   * Creates a new user profile.
   * The ID must match the UUID assigned by Supabase Auth.
   * @param createUsuarioDto The user creation payload
   * @returns The created UsuarioResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.usuarioService.create(createUsuarioDto);
  }

  /**
   * Updates a user's name or role.
   * @param id The UUID of the user
   * @param updateUsuarioDto The updated fields
   * @returns The updated UsuarioResponseDto
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  /**
   * Deletes a user profile by UUID.
   * @param id The UUID of the user
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usuarioService.remove(id);
  }

}

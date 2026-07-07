import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignEmpresaDto } from './dto/assign-empresa.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all users and maps them to the response DTO.
   * @returns Array of UsuarioResponseDto
   */
  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.prisma.usuario.findMany();
    return usuarios.map((u) => this.toResponseDto(u));
  }

  /**
   * Retrieves a specific user by their UUID.
   * @param id The UUID of the user (matches Supabase auth.users UUID)
   * @returns UsuarioResponseDto
   * @throws NotFoundException if the user does not exist
   */
  async findOne(id: string): Promise<UsuarioResponseDto> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('El usuario no fue encontrado');
    }

    return this.toResponseDto(usuario);
  }

  /**
   * Creates a new user profile. The ID must match the user's UUID in Supabase Auth.
   * @param createUsuarioDto The data to create the user profile
   * @returns UsuarioResponseDto
   * @throws ConflictException if the ID or email is already registered
   */
  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    const existingById = await this.prisma.usuario.findUnique({
      where: { id: createUsuarioDto.id },
    });

    if (existingById) {
      throw new ConflictException('Ya existe un usuario registrado con este ID');
    }

    const existingByEmail = await this.prisma.usuario.findUnique({
      where: { email: createUsuarioDto.email },
    });

    if (existingByEmail) {
      throw new ConflictException(
        'Ya existe un usuario registrado con este correo electrónico',
      );
    }

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        id: createUsuarioDto.id,
        email: createUsuarioDto.email,
        nombre: createUsuarioDto.nombre,
        rol: createUsuarioDto.rol,
      },
    });

    this.logger.log(`New user profile created with ID: ${nuevoUsuario.id}`);
    return this.toResponseDto(nuevoUsuario);
  }

  /**
   * Updates an existing user's name or role.
   * Email and ID cannot be updated to ensure consistency with Supabase Auth.
   * @param id The UUID of the user
   * @param updateUsuarioDto The updated data
   * @returns UsuarioResponseDto
   * @throws NotFoundException if the user does not exist
   */
  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    await this.findOne(id); // Ensures the user exists

    const usuarioActualizado = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: updateUsuarioDto.nombre,
        rol: updateUsuarioDto.rol,
      },
    });

    return this.toResponseDto(usuarioActualizado);
  }

  /**
   * Deletes a user profile by UUID.
   * Cascade rules in the schema handle deletion of EmpresaUsuario relations.
   * @param id The UUID of the user
   * @throws NotFoundException if the user does not exist
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id); // Ensures the user exists

    await this.prisma.usuario.delete({ where: { id } });
    this.logger.log(`User profile with ID ${id} has been deleted`);
  }



  /**
   * Maps a Prisma Usuario entity to a BFF-friendly UsuarioResponseDto.
   * Keeps the mapping logic centralized and DRY.
   * @param usuario The raw Prisma Usuario entity
   * @returns UsuarioResponseDto
   */
  private toResponseDto(usuario: {
    id: string;
    email: string;
    nombre: string;
    rol: any;
    activo: boolean;
  }): UsuarioResponseDto {
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
    };
  }
}

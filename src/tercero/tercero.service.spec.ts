import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTerceroDto } from './dto/create-tercero.dto';
import { TerceroService } from './tercero.service';

const mockPrismaService = {
  tercero: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockTercero = {
  rut: '76123456-K',
  razonSocial: 'Proveedor Mayoriza SpA',
  giro: 'Servicios informáticos',
};

const mockTerceroNullGiro = {
  rut: '12345678-9',
  razonSocial: 'Cliente Natural',
  giro: null,
};

describe('TerceroService', () => {
  let service: TerceroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TerceroService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TerceroService>(TerceroService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all terceros ordered alphabetically', async () => {
      mockPrismaService.tercero.findMany.mockResolvedValue([mockTercero]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].rut).toEqual(mockTercero.rut);
      expect(mockPrismaService.tercero.findMany).toHaveBeenCalledWith({
        orderBy: { razonSocial: 'asc' },
      });
    });

    it('should return an empty array when no terceros exist', async () => {
      mockPrismaService.tercero.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a mapped DTO when tercero exists', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(mockTercero);
      const result = await service.findOne(mockTercero.rut);
      expect(result).toEqual({
        rut: mockTercero.rut,
        razonSocial: mockTercero.razonSocial,
        giro: mockTercero.giro,
      });
    });

    it('should correctly map a null giro field', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(mockTerceroNullGiro);
      const result = await service.findOne(mockTerceroNullGiro.rut);
      expect(result.giro).toBeNull();
    });

    it('should throw NotFoundException when tercero does not exist', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(null);
      await expect(service.findOne('00000000-0')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateTerceroDto = {
      rut: '98765432-1',
      razonSocial: 'Nuevo Cliente Ltda.',
      giro: 'Comercio al por menor',
    };

    it('should create and return a new tercero on happy path', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(null);
      mockPrismaService.tercero.create.mockResolvedValue(createDto);
      const result = await service.create(createDto);
      expect(result.rut).toEqual(createDto.rut);
      expect(mockPrismaService.tercero.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when RUT already exists', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(mockTercero);
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return the tercero on happy path', async () => {
      const updated = { ...mockTercero, razonSocial: 'Proveedor Actualizado SpA' };
      mockPrismaService.tercero.findUnique.mockResolvedValue(mockTercero);
      mockPrismaService.tercero.update.mockResolvedValue(updated);
      const result = await service.update(mockTercero.rut, {
        razonSocial: 'Proveedor Actualizado SpA',
      });
      expect(result.razonSocial).toEqual('Proveedor Actualizado SpA');
    });

    it('should throw NotFoundException when tercero does not exist', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(null);
      await expect(
        service.update('00000000-0', { razonSocial: 'Inexistente' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the tercero on happy path', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(mockTercero);
      mockPrismaService.tercero.delete.mockResolvedValue(mockTercero);
      await expect(service.remove(mockTercero.rut)).resolves.toBeUndefined();
      expect(mockPrismaService.tercero.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when tercero does not exist', async () => {
      mockPrismaService.tercero.findUnique.mockResolvedValue(null);
      await expect(service.remove('00000000-0')).rejects.toThrow(NotFoundException);
    });
  });
});

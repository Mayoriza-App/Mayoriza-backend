import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CentroCostoService } from './centro-costo.service';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';

const mockPrismaService = {
  centroCosto: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockCentro = { id: 1, nombre: 'Administración' };

describe('CentroCostoService', () => {
  let service: CentroCostoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CentroCostoService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CentroCostoService>(CentroCostoService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all cost centers ordered alphabetically', async () => {
      mockPrismaService.centroCosto.findMany.mockResolvedValue([mockCentro]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 1, nombre: 'Administración' });
      expect(mockPrismaService.centroCosto.findMany).toHaveBeenCalledWith({
        orderBy: { nombre: 'asc' },
      });
    });

    it('should return an empty array when no cost centers exist', async () => {
      mockPrismaService.centroCosto.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a mapped DTO when cost center exists', async () => {
      mockPrismaService.centroCosto.findUnique.mockResolvedValue(mockCentro);
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1, nombre: 'Administración' });
    });

    it('should throw NotFoundException when cost center does not exist', async () => {
      mockPrismaService.centroCosto.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateCentroCostoDto = { nombre: 'Ventas' };

    it('should create and return a new cost center on happy path', async () => {
      mockPrismaService.centroCosto.findFirst.mockResolvedValue(null);
      mockPrismaService.centroCosto.create.mockResolvedValue({
        id: 2,
        nombre: 'Ventas',
      });
      const result = await service.create(createDto);
      expect(result).toEqual({ id: 2, nombre: 'Ventas' });
      expect(mockPrismaService.centroCosto.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when name already exists (case-insensitive)', async () => {
      mockPrismaService.centroCosto.findFirst.mockResolvedValue(mockCentro);
      await expect(service.create({ nombre: 'administración' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the cost center on happy path', async () => {
      const updated = { id: 1, nombre: 'Administración General' };
      mockPrismaService.centroCosto.findUnique.mockResolvedValue(mockCentro);
      mockPrismaService.centroCosto.findFirst.mockResolvedValue(null);
      mockPrismaService.centroCosto.update.mockResolvedValue(updated);
      const result = await service.update(1, { nombre: 'Administración General' });
      expect(result.nombre).toEqual('Administración General');
    });

    it('should throw NotFoundException when cost center does not exist', async () => {
      mockPrismaService.centroCosto.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { nombre: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when new name is taken by another cost center', async () => {
      mockPrismaService.centroCosto.findUnique.mockResolvedValue(mockCentro);
      mockPrismaService.centroCosto.findFirst.mockResolvedValue({
        id: 2,
        nombre: 'Ventas',
      });
      await expect(service.update(1, { nombre: 'Ventas' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the cost center on happy path', async () => {
      mockPrismaService.centroCosto.findUnique.mockResolvedValue(mockCentro);
      mockPrismaService.centroCosto.delete.mockResolvedValue(mockCentro);
      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockPrismaService.centroCosto.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when cost center does not exist', async () => {
      mockPrismaService.centroCosto.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TipoCuenta } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteFilterDto } from './dto/reporte-filter.dto';
import { ReporteService } from './reporte.service';

const mockPrismaService = {
  movimiento: {
    findMany: jest.fn(),
  },
};

const mockMovimientosBalance = [
  {
    cuentaCodigo: '1.1.01',
    debe: 1000n, // BigInt from DB
    haber: 200n, // BigInt from DB
    cuenta: { nombre: 'Caja', tipo: TipoCuenta.ACTIVO },
  },
  {
    cuentaCodigo: '1.1.01',
    debe: 500n,
    haber: 100n,
    cuenta: { nombre: 'Caja', tipo: TipoCuenta.ACTIVO },
  },
  {
    cuentaCodigo: '2.1.01',
    debe: 0n,
    haber: 2000n,
    cuenta: { nombre: 'Proveedores', tipo: TipoCuenta.PASIVO },
  },
  {
    cuentaCodigo: '4.1.01',
    debe: 0n,
    haber: 3000n,
    cuenta: { nombre: 'Ingresos por Ventas', tipo: TipoCuenta.RESULTADO_GANANCIA },
  },
  {
    cuentaCodigo: '5.1.01',
    debe: 1500n,
    haber: 0n,
    cuenta: { nombre: 'Costo de Ventas', tipo: TipoCuenta.RESULTADO_PERDIDA },
  },
];

const mockMovimientosF29 = [
  {
    debe: 0n,
    haber: 190n,
    cuenta: { nombre: 'IVA Débito Fiscal' },
  },
  {
    debe: 0n,
    haber: 380n,
    cuenta: { nombre: 'IVA Débito Fiscal' },
  },
  {
    debe: 95n,
    haber: 0n,
    cuenta: { nombre: 'IVA Crédito Fiscal' },
  },
  {
    debe: 0n,
    haber: 100n,
    cuenta: { nombre: 'Retención Honorarios' },
  },
];

describe('ReporteService', () => {
  let service: ReporteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReporteService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReporteService>(ReporteService);
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should aggregate movements correctly and compute totals', async () => {
      mockPrismaService.movimiento.findMany.mockResolvedValue(mockMovimientosBalance);
      
      const filter: ReporteFilterDto = { empresaRut: '76123456-K' };
      const result = await service.getBalance(filter);

      expect(result.cuentas).toHaveLength(4);

      const caja = result.cuentas.find(c => c.cuentaCodigo === '1.1.01');
      expect(caja).toBeDefined();
      expect(caja!.totalDebe).toEqual(1500); // 1000 + 500
      expect(caja!.totalHaber).toEqual(300); // 200 + 100
      expect(caja!.saldoDeudor).toEqual(1200);
      expect(caja!.saldoAcreedor).toEqual(0);

      const proveedores = result.cuentas.find(c => c.cuentaCodigo === '2.1.01');
      expect(proveedores!.saldoDeudor).toEqual(0);
      expect(proveedores!.saldoAcreedor).toEqual(2000); // 2000 - 0 (PASIVO => Haber - Debe)

      expect(result.totales.activos).toEqual(1200);
      expect(result.totales.pasivos).toEqual(2000);
      expect(result.totales.resultadoGanancia).toEqual(3000);
      expect(result.totales.resultadoPerdida).toEqual(1500);
      expect(result.totales.utilidadDelEjercicio).toEqual(1500); // 3000 - 1500
    });
  });

  describe('getBorradorF29', () => {
    it('should correctly sum IVA debito, credito and calculate ivaAPagar', async () => {
      mockPrismaService.movimiento.findMany.mockResolvedValue(mockMovimientosF29);

      const filter: ReporteFilterDto = { empresaRut: '76123456-K' };
      const result = await service.getBorradorF29(filter);

      expect(result.totalIvaDebito).toEqual(570); // 190 + 380
      expect(result.totalIvaCredito).toEqual(95);
      expect(result.totalRetencionHonorarios).toEqual(100);
      expect(result.ivaAPagar).toEqual(475); // 570 - 95
    });

    it('should return 0 for ivaAPagar if credito > debito', async () => {
      mockPrismaService.movimiento.findMany.mockResolvedValue([
        { debe: 0n, haber: 100n, cuenta: { nombre: 'IVA Débito Fiscal' } },
        { debe: 500n, haber: 0n, cuenta: { nombre: 'IVA Crédito Fiscal' } },
      ]);

      const filter: ReporteFilterDto = { empresaRut: '76123456-K' };
      const result = await service.getBorradorF29(filter);

      expect(result.totalIvaDebito).toEqual(100);
      expect(result.totalIvaCredito).toEqual(500);
      expect(result.ivaAPagar).toEqual(0); // Math.max(0, 100 - 500)
    });
  });
});

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteFilterDto } from './dto/reporte-filter.dto';
import {
  BalanceResponseDto,
  BorradorF29ResponseDto,
  CuentaBalanceDto,
  EvolucionResultadosDto,
  LibroDiarioLineaDto,
  LibroDiarioResponseDto,
  LibroMayorCompletoResponseDto,
  CuentaConMovimientosDto,
} from './dto/reporte-response.dto';
import { TipoCuenta } from 'generated/prisma';

@Injectable()
export class ReporteService {
  private readonly logger = new Logger(ReporteService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a General Balance and Income Statement (Estado de Resultados) report.
   * Aggregates 'debe' and 'haber' across all Movimientos for a given company and period.
   * Calculates net balance (saldo) based on the account type (TipoCuenta).
   * @param filter The filter containing empresaRut and optional mes/anio
   * @returns BalanceResponseDto
   */
  async getBalance(userId: string, filter: ReporteFilterDto): Promise<BalanceResponseDto> {


    const movimientos = await this.prisma.movimiento.findMany({
      where: {
        comprobante: {
            empresa: { rut: filter.empresaRut, usuarioId: userId },
          ...(filter.mes !== undefined && { periodoMes: filter.mes }),
          ...(filter.anio !== undefined && { periodoAnio: filter.anio }),
          ...(filter.fechaDesde && filter.fechaHasta && { 
            fecha: { 
              gte: new Date(filter.fechaDesde + 'T00:00:00.000Z'), 
              lte: new Date(filter.fechaHasta + 'T23:59:59.999Z') 
            }
          }),
        },
      },
      include: {
        cuenta: true,
      },
    });

    const accountsMap = new Map<string, CuentaBalanceDto>();

    for (const mov of movimientos) {
      const code = (mov as any).cuentaCodigo;
      if (!accountsMap.has(code)) {
        accountsMap.set(code, {
          cuentaCodigo: code,
          cuentaNombre: (mov as any).cuenta!.nombre,
          tipo: (mov as any).cuenta!.tipo,
          totalDebe: 0,
          totalHaber: 0,
          saldoDeudor: 0,
          saldoAcreedor: 0,
          activo: 0,
          pasivo: 0,
          perdida: 0,
          ganancia: 0,
        });
      }

      const acc = accountsMap.get(code)!;

      acc.totalDebe += Number(mov.debe);
      acc.totalHaber += Number(mov.haber);
    }

    const cuentas = Array.from(accountsMap.values());
    const totales = {
      debe: 0,
      haber: 0,
      saldoDeudor: 0,
      saldoAcreedor: 0,
      activos: 0,
      pasivos: 0,
      resultadoPerdida: 0,
      resultadoGanancia: 0,
      utilidadDelEjercicio: 0,
    };

    for (const acc of cuentas) {
      totales.debe += acc.totalDebe;
      totales.haber += acc.totalHaber;


      if (acc.totalDebe > acc.totalHaber) {
        acc.saldoDeudor = acc.totalDebe - acc.totalHaber;
      } else if (acc.totalHaber > acc.totalDebe) {
        acc.saldoAcreedor = acc.totalHaber - acc.totalDebe;
      }
      totales.saldoDeudor += acc.saldoDeudor;
      totales.saldoAcreedor += acc.saldoAcreedor;


      switch (acc.tipo) {
        case TipoCuenta.ACTIVO:

          if (acc.saldoDeudor > 0) {
            acc.activo = acc.saldoDeudor;
            totales.activos += acc.activo;
          } else if (acc.saldoAcreedor > 0) {
            acc.pasivo = acc.saldoAcreedor;
            totales.pasivos += acc.pasivo;
          }
          break;

        case TipoCuenta.PASIVO:
        case TipoCuenta.PATRIMONIO:

          if (acc.saldoAcreedor > 0) {
            acc.pasivo = acc.saldoAcreedor;
            totales.pasivos += acc.pasivo;
          } else if (acc.saldoDeudor > 0) {
            acc.activo = acc.saldoDeudor;
            totales.activos += acc.activo;
          }
          break;

        case TipoCuenta.RESULTADO_PERDIDA:
        case TipoCuenta.RESULTADO_GANANCIA:



          if (acc.saldoDeudor > 0) {
            acc.perdida = acc.saldoDeudor;
            totales.resultadoPerdida += acc.perdida;
          } else if (acc.saldoAcreedor > 0) {
            acc.ganancia = acc.saldoAcreedor;
            totales.resultadoGanancia += acc.ganancia;
          }
          break;
      }
    }



    totales.utilidadDelEjercicio =
      totales.resultadoGanancia - totales.resultadoPerdida;

    cuentas.sort((a, b) => a.cuentaCodigo.localeCompare(b.cuentaCodigo));

    this.logger.log(
      `Balance generated for empresa ${filter.empresaRut}. ` +
      `Cuadratura: Financiero=${totales.activos - totales.pasivos}, ` +
      `Económico=${totales.utilidadDelEjercicio}`,
    );

    return {
      empresaRut: filter.empresaRut,
      periodoAnio: filter.anio,
      periodoMes: filter.mes,
      cuentas,
      totales,
    };
  }

  /**
   * Generates a draft of the F29 Tax Report (Borrador F29).
   * Summarizes IVA from sales (Debito) and purchases (Credito), plus Honorarios retentions.
   * @param filter The filter containing empresaRut and optional mes/anio
   * @returns BorradorF29ResponseDto
   */
  async getBorradorF29(userId: string, filter: ReporteFilterDto): Promise<BorradorF29ResponseDto> {
    const movimientos = await this.prisma.movimiento.findMany({
      where: {
        comprobante: {
            empresa: { rut: filter.empresaRut, usuarioId: userId },
          ...(filter.mes !== undefined && { periodoMes: filter.mes }),
          ...(filter.anio !== undefined && { periodoAnio: filter.anio }),
        },
      },
      include: {
        cuenta: true,
      },
    });

    let totalIvaDebito = 0;
    let totalIvaCredito = 0;
    let totalRetencionHonorarios = 0;






    
    for (const mov of movimientos) {
      const nombreCuenta = (mov as any).cuenta!.nombre.toLowerCase();
      
      if (nombreCuenta.includes('iva') && nombreCuenta.includes('débito')) {
        totalIvaDebito += Number(mov.haber) - Number(mov.debe);
      } else if (nombreCuenta.includes('iva') && nombreCuenta.includes('crédito')) {
        totalIvaCredito += Number(mov.debe) - Number(mov.haber);
      } else if (nombreCuenta.includes('retención') && nombreCuenta.includes('honorario')) {
        totalRetencionHonorarios += Number(mov.haber) - Number(mov.debe);
      }
    }

    const ivaAPagar = Math.max(0, totalIvaDebito - totalIvaCredito);

    this.logger.log(`Borrador F29 generated for empresa ${filter.empresaRut}`);

    return {
      empresaRut: filter.empresaRut,
      periodoAnio: filter.anio,
      periodoMes: filter.mes,
      totalIvaDebito,
      totalIvaCredito,
      totalRetencionHonorarios,
      ivaAPagar,
    };
  }

  /**
   * Genera el Libro Mayor para una cuenta específica.
   */
  async getLibroMayor(userId: string, filter: ReporteFilterDto, cuentaCodigo: string): Promise<any> {
    const allMovimientos = await this.prisma.movimiento.findMany({
      where: {
        cuentaCodigo,
        comprobante: { 
          empresa: { rut: filter.empresaRut, usuarioId: userId },

          ...(filter.anio !== undefined && { periodoAnio: { lte: filter.anio } }),
        }
      },
      include: {
        comprobante: true,
        cuenta: true,
        tercero: true,
        centroCosto: true
      },
      orderBy: [
        { comprobante: { fecha: 'asc' } },
        { comprobanteId: 'asc' }
      ]
    });

    if (allMovimientos.length === 0) {

      const cuenta = await this.prisma.cuentaEmpresa.findFirst({
        where: { empresa: { rut: filter.empresaRut, usuarioId: userId }, codigo: cuentaCodigo }
      });
      const esDeudor = cuenta ? (cuenta.tipo === TipoCuenta.ACTIVO || cuenta.tipo === TipoCuenta.RESULTADO_PERDIDA) : true;
      return {
        empresaRut: filter.empresaRut,
        cuentaCodigo,
        cuentaNombre: cuenta?.nombre || 'Cuenta sin nombre',
        lineas: [],
        totalDebe: 0,
        totalHaber: 0,
        saldoFinal: 0,
        saldoInicial: 0,
        esDeudor,
      };
    }

    let saldoInicial = 0;
    let totalDebe = 0;
    let totalHaber = 0;
    const tipo = allMovimientos[0].cuenta!.tipo;
    const cuentaNombre = allMovimientos[0].cuenta!.nombre;
    const esDeudor = (tipo === TipoCuenta.ACTIVO || tipo === TipoCuenta.RESULTADO_PERDIDA);

    const lineas: any[] = [];
    let prevSaldo = 0;

    for (const m of allMovimientos) {
      const debe = Number(m.debe);
      const haber = Number(m.haber);

      const isBeforePeriod = filter.mes !== undefined 
        ? (m.comprobante.periodoAnio < filter.anio!) || (m.comprobante.periodoAnio === filter.anio && m.comprobante.periodoMes < filter.mes)
        : (m.comprobante.periodoAnio < filter.anio!);

      if (isBeforePeriod) {
        saldoInicial += esDeudor ? (debe - haber) : (haber - debe);
        prevSaldo = saldoInicial;
      } else if (m.comprobante.periodoAnio === filter.anio && (filter.mes === undefined || m.comprobante.periodoMes === filter.mes)) {
        totalDebe += debe;
        totalHaber += haber;

        prevSaldo += esDeudor ? (debe - haber) : (haber - debe);

        lineas.push({
          fecha: m.comprobante.fecha.toISOString().split('T')[0],
          comprobanteId: m.comprobanteId,
          comprobanteTipo: m.comprobante.tipo,
          glosaLinea: m.glosaLinea || m.comprobante.glosaGeneral,
          debe,
          haber,
          saldoAcumulado: prevSaldo,
          terceroRut: m.tercero?.rut,
          terceroRazonSocial: m.tercero?.razonSocial,
          centroCostoNombre: m.centroCosto?.nombre,
        });
      }
    }

    return {
      empresaRut: filter.empresaRut,
      cuentaCodigo,
      cuentaNombre,
      lineas,
      totalDebe,
      totalHaber,
      saldoFinal: prevSaldo,
      saldoInicial,
      esDeudor,
    };
  }

  /**
   * Genera el Libro Mayor Completo agrupando por todas las cuentas.
   */
  async getLibroMayorCompleto(userId: string, filter: ReporteFilterDto): Promise<LibroMayorCompletoResponseDto> {
    const allMovimientos = await this.prisma.movimiento.findMany({
      where: {
        comprobante: {
          empresa: { rut: filter.empresaRut, usuarioId: userId },

          ...(filter.anio !== undefined && { periodoAnio: { lte: filter.anio } }),
        },
      },
      include: {
        comprobante: true,
        cuenta: true,
        tercero: true,
        centroCosto: true
      },
      orderBy: [
        { cuentaCodigo: 'asc' },
        { comprobante: { fecha: 'asc' } },
        { comprobanteId: 'asc' }
      ]
    });

    const cuentasMap = new Map<string, CuentaConMovimientosDto>();

    for (const m of allMovimientos) {
      const tipo = m.cuenta!.tipo;
      const esDeudor = (tipo === TipoCuenta.ACTIVO || tipo === TipoCuenta.RESULTADO_PERDIDA);

      if (!cuentasMap.has(m.cuentaCodigo)) {
        cuentasMap.set(m.cuentaCodigo, {
          cuentaCodigo: m.cuentaCodigo,
          cuentaNombre: m.cuenta!.nombre,
          lineas: [],
          totalDebe: 0,
          totalHaber: 0,
          saldoFinal: 0,
          saldoInicial: 0,
          esDeudor,
        });
      }

      const cuenta = cuentasMap.get(m.cuentaCodigo)!;
      const debe = Number(m.debe);
      const haber = Number(m.haber);
      
      const isBeforePeriod = filter.mes !== undefined 
        ? (m.comprobante.periodoAnio < filter.anio!) || (m.comprobante.periodoAnio === filter.anio && m.comprobante.periodoMes < filter.mes)
        : (m.comprobante.periodoAnio < filter.anio!);

      if (isBeforePeriod) {

        cuenta.saldoInicial = (cuenta.saldoInicial ?? 0) + (esDeudor ? (debe - haber) : (haber - debe));
        cuenta.saldoFinal = cuenta.saldoInicial;
      } else if (m.comprobante.periodoAnio === filter.anio && (filter.mes === undefined || m.comprobante.periodoMes === filter.mes)) {

        cuenta.totalDebe += debe;
        cuenta.totalHaber += haber;

        let prevSaldo = cuenta.lineas.length > 0 ? cuenta.lineas[cuenta.lineas.length - 1].saldoAcumulado : (cuenta.saldoInicial ?? 0);
        let nuevoSaldo = prevSaldo + (esDeudor ? (debe - haber) : (haber - debe));

        cuenta.saldoFinal = nuevoSaldo;

        cuenta.lineas.push({
          fecha: m.comprobante.fecha.toISOString().split('T')[0],
          comprobanteId: m.comprobanteId,
          comprobanteTipo: m.comprobante.tipo,
          glosaLinea: m.glosaLinea || m.comprobante.glosaGeneral,
          debe,
          haber,
          saldoAcumulado: nuevoSaldo,
          terceroRut: m.tercero?.rut,
          terceroRazonSocial: m.tercero?.razonSocial,
          centroCostoNombre: m.centroCosto?.nombre,
        });
      }
    }

    const cuentasFiltradas = Array.from(cuentasMap.values()).filter(c => c.lineas.length > 0);

    return {
      empresaRut: filter.empresaRut,
      periodoAnio: filter.anio,
      periodoMes: filter.mes,
      cuentas: cuentasFiltradas
    };
  }

  /**
   * Generates a monthly evolution of revenues and expenses for the last 6 months up to the given filter month.
   */
  async getEvolucionResultados(userId: string, filter: ReporteFilterDto): Promise<EvolucionResultadosDto> {
    const endAnio = filter.anio || new Date().getFullYear();
    const endMes = filter.mes || new Date().getMonth() + 1;

    const periodos: { mes: number; anio: number }[] = [];
    let currentMes = endMes;
    let currentAnio = endAnio;

    for (let i = 0; i < 6; i++) {
      periodos.push({ mes: currentMes, anio: currentAnio });
      currentMes--;
      if (currentMes === 0) {
        currentMes = 12;
        currentAnio--;
      }
    }

    periodos.reverse();

    const meses = await Promise.all(
      periodos.map(async (periodo) => {

        const movimientos = await this.prisma.movimiento.findMany({
          where: {
            comprobante: {
            empresa: { rut: filter.empresaRut, usuarioId: userId },
              periodoMes: periodo.mes,
              periodoAnio: periodo.anio,
            },
            cuenta: {
              tipo: {
                in: [TipoCuenta.RESULTADO_GANANCIA, TipoCuenta.RESULTADO_PERDIDA],
              },
            },
          },
          include: { cuenta: true },
        });

        let ingresos = 0;
        let egresos = 0;

        for (const mov of movimientos) {
          if ((mov as any).cuenta!.tipo === TipoCuenta.RESULTADO_GANANCIA) {

            ingresos += Number(mov.haber) - Number(mov.debe);
          } else if ((mov as any).cuenta!.tipo === TipoCuenta.RESULTADO_PERDIDA) {

            egresos += Number(mov.debe) - Number(mov.haber);
          }
        }

        return {
          mes: periodo.mes,
          anio: periodo.anio,
          ingresos,
          egresos,
          utilidad: ingresos - egresos,
        };
      })
    );

    return {
      empresaRut: filter.empresaRut,
      meses,
    };
  }

  async getAniosDisponibles(userId: string, empresaRut: string): Promise<number[]> {
    const periodos = await this.prisma.comprobante.groupBy({
      by: ['periodoAnio'],
      where: { empresa: { rut: empresaRut, usuarioId: userId } },
      orderBy: { periodoAnio: 'desc' }
    });
    
    if (periodos.length === 0) {
      return [new Date().getFullYear()];
    }
    return periodos.map(p => p.periodoAnio);
  }

  async getLibroDiario(userId: string, filter: ReporteFilterDto): Promise<LibroDiarioResponseDto> {
    const { empresaRut, mes, anio } = filter;
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const targetMes = mes !== undefined ? mes : currentMonth;
    const targetAnio = anio || currentYear;

    const movimientosMes = await this.prisma.movimiento.findMany({
      where: {
        comprobante: {
            empresa: { rut: empresaRut, usuarioId: userId },
          periodoAnio: targetAnio,
          ...(targetMes !== 0 && { periodoMes: targetMes })
        }
      },
      include: {
        comprobante: true,
        cuenta: true,
      },
      orderBy: [
        { comprobante: { fecha: 'asc' } },
        { comprobanteId: 'asc' },
        { id: 'asc' }
      ]
    });

    const lineas: LibroDiarioLineaDto[] = [];
    let currentComprobanteId = 0;
    let sec = 1;
    let totalDebeMes = 0n;
    let totalHaberMes = 0n;

    for (const mov of movimientosMes) {
      if ((mov as any).comprobanteId !== currentComprobanteId) {
        currentComprobanteId = (mov as any).comprobanteId;
        sec = 1;
      }

      const dia = String((mov as any).comprobante.fecha.getUTCDate()).padStart(2, '0');
      
      let tipoStr = 'TRA';
      if ((mov as any).comprobante.tipo === 'INGRESO') tipoStr = 'ING';
      if ((mov as any).comprobante.tipo === 'EGRESO') tipoStr = 'EGR';

      const compStr = String((mov as any).comprobante.id).padStart(6, '0');
      const secStr = String(sec).padStart(2, '0');

      lineas.push({
        dia,
        tipo: tipoStr,
        comprobante: compStr,
        secuencia: secStr,
        glosa: mov.glosaLinea || (mov as any).comprobante.glosaGeneral,
        debe: Number(mov.debe),
        haber: Number(mov.haber),
        cuenta: `${(mov as any).cuenta.codigo} ${(mov as any).cuenta.nombre}`
      });

      totalDebeMes += mov.debe;
      totalHaberMes += mov.haber;
      sec++;
    }

    const whereAcumulado = { 
      periodoAnio: targetAnio,
      periodoMes: { lt: targetMes === 0 ? 1 : targetMes }
    };

    const movimientosAnteriores = await this.prisma.movimiento.findMany({
      where: {
        comprobante: {
            empresa: { rut: empresaRut, usuarioId: userId },
          ...whereAcumulado
        }
      },
      select: {
        debe: true,
        haber: true
      }
    });

    let totalDebeAnterior = 0n;
    let totalHaberAnterior = 0n;

    for (const mov of movimientosAnteriores) {
      totalDebeAnterior += mov.debe;
      totalHaberAnterior += mov.haber;
    }

    return {
      empresaRut,
      periodoAnio: targetAnio,
      periodoMes: targetMes,
      lineas,
      totalesMes: {
        debe: Number(totalDebeMes),
        haber: Number(totalHaberMes)
      },
      acumulacionesAnteriores: {
        debe: Number(totalDebeAnterior),
        haber: Number(totalHaberAnterior)
      },
      totalesPeriodo: {
        debe: Number(totalDebeMes + totalDebeAnterior),
        haber: Number(totalHaberMes + totalHaberAnterior)
      }
    };
  }
}

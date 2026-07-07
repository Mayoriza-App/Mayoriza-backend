/*
  Warnings:

  - You are about to drop the `cuentas_contables` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "movimientos" DROP CONSTRAINT "movimientos_cuenta_codigo_fkey";

-- AlterTable
ALTER TABLE "movimientos" ADD COLUMN     "cuenta_empresa_id" INTEGER,
ALTER COLUMN "cuenta_codigo" DROP NOT NULL;

-- DropTable
DROP TABLE "cuentas_contables";

-- CreateTable
CREATE TABLE "cuentas_plantilla" (
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cuentas_plantilla_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "cuentas_empresa" (
    "id" SERIAL NOT NULL,
    "empresa_rut" TEXT NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,

    CONSTRAINT "cuentas_empresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_empresa_empresa_rut_codigo_key" ON "cuentas_empresa"("empresa_rut", "codigo");

-- AddForeignKey
ALTER TABLE "cuentas_empresa" ADD CONSTRAINT "cuentas_empresa_empresa_rut_fkey" FOREIGN KEY ("empresa_rut") REFERENCES "empresas"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_cuenta_empresa_id_fkey" FOREIGN KEY ("cuenta_empresa_id") REFERENCES "cuentas_empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

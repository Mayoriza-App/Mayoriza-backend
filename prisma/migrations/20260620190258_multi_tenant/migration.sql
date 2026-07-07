/*
  Warnings:

  - You are about to alter the column `debe` on the `movimientos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `BigInt`.
  - You are about to alter the column `haber` on the `movimientos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `BigInt`.

*/
-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'CONTADOR', 'CLIENTE');

-- AlterTable
ALTER TABLE "movimientos" ALTER COLUMN "debe" SET DEFAULT 0,
ALTER COLUMN "debe" SET DATA TYPE BIGINT,
ALTER COLUMN "haber" SET DEFAULT 0,
ALTER COLUMN "haber" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'CONTADOR',

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas_usuarios" (
    "usuario_id" UUID NOT NULL,
    "empresa_rut" TEXT NOT NULL,

    CONSTRAINT "empresas_usuarios_pkey" PRIMARY KEY ("usuario_id","empresa_rut")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "empresas_usuarios" ADD CONSTRAINT "empresas_usuarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresas_usuarios" ADD CONSTRAINT "empresas_usuarios_empresa_rut_fkey" FOREIGN KEY ("empresa_rut") REFERENCES "empresas"("rut") ON DELETE CASCADE ON UPDATE CASCADE;

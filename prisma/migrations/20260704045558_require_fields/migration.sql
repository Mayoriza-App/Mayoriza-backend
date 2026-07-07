/*
  Warnings:

  - Made the column `cuenta_codigo` on table `movimientos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cuenta_empresa_id` on table `movimientos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "movimientos" ALTER COLUMN "cuenta_codigo" SET NOT NULL,
ALTER COLUMN "cuenta_empresa_id" SET NOT NULL;

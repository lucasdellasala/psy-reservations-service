import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DbService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta una función dentro de una transacción con lock por terapeuta
   * Usa pg_advisory_xact_lock para serializar operaciones del mismo terapeuta
   *
   * @param therapistId - ID del terapeuta para el lock
   * @param fn - Función a ejecutar dentro de la transacción
   * @returns Resultado de la función
   */
  async withTherapistLock<T>(
    therapistId: string,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async tx => {
      // Adquirir lock usando pg_advisory_xact_lock
      // Convertimos el therapistId a un número para el lock
      const lockKey = this.hashStringToNumber(therapistId);

      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey})`;

      // Ejecutar la función con el cliente de transacción
      return await fn(tx);
    });
  }

  /**
   * Convierte un string a un número para usar como key en pg_advisory_xact_lock
   * PostgreSQL requiere un entero para el lock, así que hacemos hash del string
   */
  private hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

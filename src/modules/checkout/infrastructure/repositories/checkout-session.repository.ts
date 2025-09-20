import { CheckoutSessionEntity } from '../../domain/entities/checkout-session.entity';
import { CheckoutSessionId } from '../../domain/value-objects/checkout-session-id';
import { CheckoutSessionNotFoundError } from '../../domain/errors/checkout-errors';
import { EstadoCheckout } from '../../domain/types/checkout.types';

/**
 * Repositorio para sesiones de checkout
 */
export class CheckoutSessionRepository {
  private collection: any;

  constructor() {
    // Mock de la colección de base de datos
    this.collection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      find: jest.fn(),
      deleteMany: jest.fn(),
      aggregate: jest.fn(),
    };
  }

  async guardar(session: CheckoutSessionEntity): Promise<void> {
    try {
      const data = session.toPersistence();

      // Intentar actualizar primero
      const updateResult = await this.collection.updateOne(
        { _id: session.id.value },
        { $set: data },
        { upsert: true }
      );

      if (!updateResult.acknowledged) {
        // Si no se pudo actualizar, insertar
        await this.collection.insertOne({
          _id: session.id.value,
          ...data,
        });
      }
    } catch (error) {
      throw new Error(`Error al guardar sesión de checkout: ${error.message}`);
    }
  }

  async obtenerPorId(id: CheckoutSessionId): Promise<CheckoutSessionEntity | null> {
    try {
      const data = await this.collection.findOne({ _id: id.value });

      if (!data) {
        return null;
      }

      return CheckoutSessionEntity.fromPersistence(data);
    } catch (error) {
      throw new Error(`Error al obtener sesión de checkout: ${error.message}`);
    }
  }

  async obtenerPorCarritoId(carritoId: string): Promise<CheckoutSessionEntity | null> {
    try {
      const data = await this.collection.findOne({ carritoId });

      if (!data) {
        return null;
      }

      return CheckoutSessionEntity.fromPersistence(data);
    } catch (error) {
      throw new Error(`Error al obtener sesión por carrito: ${error.message}`);
    }
  }

  async obtenerPorClienteId(clienteId: string): Promise<CheckoutSessionEntity[]> {
    try {
      const cursor = this.collection.find({ clienteId });
      const data = await cursor.toArray();

      return data.map((item: any) => CheckoutSessionEntity.fromPersistence(item));
    } catch (error) {
      throw new Error(`Error al obtener sesiones por cliente: ${error.message}`);
    }
  }

  async obtenerSesionesExpiradas(): Promise<CheckoutSessionEntity[]> {
    try {
      const cursor = this.collection.find({
        fechaExpiracion: { $lt: new Date() },
        estado: { $in: [EstadoCheckout.INICIADO, EstadoCheckout.PAGO_CONFIRMADO] },
      });

      const data = await cursor.toArray();
      return data.map((item: any) => CheckoutSessionEntity.fromPersistence(item));
    } catch (error) {
      throw new Error(`Error al obtener sesiones expiradas: ${error.message}`);
    }
  }

  async eliminar(id: CheckoutSessionId): Promise<void> {
    try {
      const result = await this.collection.deleteOne({ _id: id.value });

      if (result.deletedCount === 0) {
        throw new CheckoutSessionNotFoundError(id.value);
      }
    } catch (error) {
      if (error instanceof CheckoutSessionNotFoundError) {
        throw error;
      }
      throw new Error(`Error al eliminar sesión de checkout: ${error.message}`);
    }
  }

  async limpiarSesionesExpiradas(): Promise<number> {
    try {
      const result = await this.collection.deleteMany({
        fechaExpiracion: { $lt: new Date() },
        estado: { $in: [EstadoCheckout.INICIADO] },
      });

      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(`Error al limpiar sesiones expiradas: ${error.message}`);
    }
  }

  async obtenerEstadisticas(): Promise<Record<string, number>> {
    try {
      const cursor = this.collection.aggregate([
        {
          $group: {
            _id: '$estado',
            count: { $sum: 1 },
          },
        },
      ]);

      const data = await cursor.toArray();
      const estadisticas: Record<string, number> = {};
      let total = 0;

      data.forEach((item: any) => {
        estadisticas[item._id] = item.count;
        total += item.count;
      });

      estadisticas.total = total;
      return estadisticas;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

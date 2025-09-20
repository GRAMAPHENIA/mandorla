import { ClienteEntity } from '@/modules/clientes/domain/entities/cliente-entity';
import { Email } from '@/modules/clientes/domain/value-objects/email';
import { Telefono } from '@/modules/clientes/domain/value-objects/telefono';
import { Direccion } from '@/modules/clientes/domain/value-objects/direccion';
import type { CrearClienteDto } from '@/modules/clientes/application/dtos/crear-cliente.dto';

/**
 * Factory para crear clientes de prueba
 */
export class ClienteFactory {
  static crearClienteValido(overrides: Partial<CrearClienteDto> = {}): CrearClienteDto {
    return {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@email.com',
      telefono: '+57 300 123 4567',
      direccion: {
        calle: 'Calle 123 #45-67',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        codigoPostal: '110111',
        pais: 'Colombia',
      },
      fechaNacimiento: new Date('1990-05-15'),
      ...overrides,
    };
  }

  static crearEntidadCliente(overrides: Partial<CrearClienteDto> = {}): ClienteEntity {
    const datos = this.crearClienteValido(overrides);
    return ClienteEntity.crear(datos);
  }

  static crearClienteVip(): CrearClienteDto {
    return this.crearClienteValido({
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@email.com',
      telefono: '+57 301 987 6543',
    });
  }

  static crearClienteJoven(): CrearClienteDto {
    return this.crearClienteValido({
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      email: 'carlos.rodriguez@email.com',
      fechaNacimiento: new Date('2000-03-20'),
    });
  }

  static crearClienteExtranjero(): CrearClienteDto {
    return this.crearClienteValido({
      nombre: 'John',
      apellido: 'Smith',
      email: 'john.smith@email.com',
      telefono: '+1 555 123 4567',
      direccion: {
        calle: '123 Main Street',
        ciudad: 'New York',
        departamento: 'NY',
        codigoPostal: '10001',
        pais: 'Estados Unidos',
      },
    });
  }
}

/**
 * Fixtures de clientes para tests
 */
export const CLIENTE_FIXTURES = {
  CLIENTE_BASICO: ClienteFactory.crearClienteValido(),
  CLIENTE_VIP: ClienteFactory.crearClienteVip(),
  CLIENTE_JOVEN: ClienteFactory.crearClienteJoven(),
  CLIENTE_EXTRANJERO: ClienteFactory.crearClienteExtranjero(),
};

/**
 * Datos inválidos para tests de validación
 */
export const CLIENTE_DATOS_INVALIDOS = {
  NOMBRE_VACIO: {
    nombre: '',
    apellido: 'Pérez',
    email: 'test@email.com',
    telefono: '+57 300 123 4567',
  },
  EMAIL_INVALIDO: {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'email-invalido',
    telefono: '+57 300 123 4567',
  },
  TELEFONO_INVALIDO: {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
    telefono: '123',
  },
  FECHA_FUTURA: {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
    telefono: '+57 300 123 4567',
    fechaNacimiento: new Date('2030-01-01'),
  },
  DIRECCION_INCOMPLETA: {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
    telefono: '+57 300 123 4567',
    direccion: {
      calle: '',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      codigoPostal: '110111',
      pais: 'Colombia',
    },
  },
};

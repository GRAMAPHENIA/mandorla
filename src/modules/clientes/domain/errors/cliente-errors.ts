/**
 * Errores específicos del dominio de clientes
 * Proyecto Mandorla - Panadería E-commerce
 */

export abstract class ClienteError extends Error {
  abstract readonly code: string;
  abstract readonly type: 'validation' | 'business' | 'not-found' | 'duplicate';

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      type: this.type,
      message: this.message,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}

// Errores de validación
export class ClienteIdInvalidoError extends ClienteError {
  readonly code = 'CLIENTE_ID_INVALIDO';
  readonly type = 'validation' as const;

  constructor(clienteId: string) {
    super(`ID de cliente inválido: ${clienteId}`, { clienteId });
  }
}

export class NombreInvalidoError extends ClienteError {
  readonly code = 'NOMBRE_INVALIDO';
  readonly type = 'validation' as const;

  constructor(nombre: string, motivo: string) {
    super(`Nombre inválido: ${nombre}. ${motivo}`, { nombre, motivo });
  }
}

export class ApellidoInvalidoError extends ClienteError {
  readonly code = 'APELLIDO_INVALIDO';
  readonly type = 'validation' as const;

  constructor(apellido: string, motivo: string) {
    super(`Apellido inválido: ${apellido}. ${motivo}`, { apellido, motivo });
  }
}

export class EmailInvalidoError extends ClienteError {
  readonly code = 'EMAIL_INVALIDO';
  readonly type = 'validation' as const;

  constructor(email: string, motivo?: string) {
    super(`Email inválido: ${email}${motivo ? `. ${motivo}` : ''}`, { email, motivo });
  }
}

export class TelefonoInvalidoError extends ClienteError {
  readonly code = 'TELEFONO_INVALIDO';
  readonly type = 'validation' as const;

  constructor(telefono: string, motivo?: string) {
    super(`Teléfono inválido: ${telefono}${motivo ? `. ${motivo}` : ''}`, { telefono, motivo });
  }
}

export class DireccionInvalidaError extends ClienteError {
  readonly code = 'DIRECCION_INVALIDA';
  readonly type = 'validation' as const;

  constructor(campo: string, valor: string, motivo?: string) {
    super(`Dirección inválida - ${campo}: ${valor}${motivo ? `. ${motivo}` : ''}`, {
      campo,
      valor,
      motivo,
    });
  }
}

export class FechaNacimientoInvalidaError extends ClienteError {
  readonly code = 'FECHA_NACIMIENTO_INVALIDA';
  readonly type = 'validation' as const;

  constructor(fecha: string, motivo: string) {
    super(`Fecha de nacimiento inválida: ${fecha}. ${motivo}`, { fecha, motivo });
  }
}

// Errores de negocio
export class ClienteNoActivoError extends ClienteError {
  readonly code = 'CLIENTE_NO_ACTIVO';
  readonly type = 'business' as const;

  constructor(clienteId: string, estadoActual: string) {
    super(`El cliente ${clienteId} no está activo (estado: ${estadoActual})`, {
      clienteId,
      estadoActual,
    });
  }
}

export class ClienteSuspendidoError extends ClienteError {
  readonly code = 'CLIENTE_SUSPENDIDO';
  readonly type = 'business' as const;

  constructor(clienteId: string, motivo?: string) {
    super(`El cliente ${clienteId} está suspendido${motivo ? `: ${motivo}` : ''}`, {
      clienteId,
      motivo,
    });
  }
}

export class ClienteBloqueadoError extends ClienteError {
  readonly code = 'CLIENTE_BLOQUEADO';
  readonly type = 'business' as const;

  constructor(clienteId: string, motivo?: string) {
    super(`El cliente ${clienteId} está bloqueado${motivo ? `: ${motivo}` : ''}`, {
      clienteId,
      motivo,
    });
  }
}

export class ClienteMenorDeEdadError extends ClienteError {
  readonly code = 'CLIENTE_MENOR_DE_EDAD';
  readonly type = 'business' as const;

  constructor(clienteId: string, edad?: number) {
    super(`El cliente ${clienteId} es menor de edad${edad ? ` (${edad} años)` : ''}`, {
      clienteId,
      edad,
    });
  }
}

export class DireccionDuplicadaError extends ClienteError {
  readonly code = 'DIRECCION_DUPLICADA';
  readonly type = 'business' as const;

  constructor(clienteId: string, direccion: string) {
    super(`El cliente ${clienteId} ya tiene registrada la dirección: ${direccion}`, {
      clienteId,
      direccion,
    });
  }
}

export class DireccionNoValidaParaDeliveryError extends ClienteError {
  readonly code = 'DIRECCION_NO_VALIDA_PARA_DELIVERY';
  readonly type = 'business' as const;

  constructor(clienteId: string, motivo?: string) {
    super(
      `La dirección del cliente ${clienteId} no es válida para delivery${
        motivo ? `: ${motivo}` : ''
      }`,
      { clienteId, motivo }
    );
  }
}

export class IndicesDireccionInvalidoError extends ClienteError {
  readonly code = 'INDICE_DIRECCION_INVALIDO';
  readonly type = 'business' as const;

  constructor(indice: number, cantidadDirecciones: number) {
    super(
      `Índice de dirección inválido: ${indice}. El cliente tiene ${cantidadDirecciones} direcciones`,
      { indice, cantidadDirecciones }
    );
  }
}

export class NoSePuedeEliminarUnicaDireccionError extends ClienteError {
  readonly code = 'NO_SE_PUEDE_ELIMINAR_UNICA_DIRECCION';
  readonly type = 'business' as const;

  constructor(clienteId: string) {
    super(`No se puede eliminar la única dirección del cliente ${clienteId}`, { clienteId });
  }
}

export class CambioEstadoInvalidoError extends ClienteError {
  readonly code = 'CAMBIO_ESTADO_INVALIDO';
  readonly type = 'business' as const;

  constructor(clienteId: string, estadoActual: string, estadoDeseado: string) {
    super(
      `No se puede cambiar el estado del cliente ${clienteId} de ${estadoActual} a ${estadoDeseado}`,
      { clienteId, estadoActual, estadoDeseado }
    );
  }
}

// Errores de búsqueda
export class ClienteNoEncontradoError extends ClienteError {
  readonly code = 'CLIENTE_NO_ENCONTRADO';
  readonly type = 'not-found' as const;

  constructor(identificador: string, tipoBusqueda: 'id' | 'email' | 'telefono' = 'id') {
    super(`Cliente no encontrado por ${tipoBusqueda}: ${identificador}`, {
      identificador,
      tipoBusqueda,
    });
  }
}

export class ClientesNoEncontradosError extends ClienteError {
  readonly code = 'CLIENTES_NO_ENCONTRADOS';
  readonly type = 'not-found' as const;

  constructor(filtros: Record<string, any>) {
    super('No se encontraron clientes con los filtros especificados', { filtros });
  }
}

// Errores de duplicación
export class EmailYaRegistradoError extends ClienteError {
  readonly code = 'EMAIL_YA_REGISTRADO';
  readonly type = 'duplicate' as const;

  constructor(email: string, clienteExistenteId?: string) {
    super(
      `El email ${email} ya está registrado${
        clienteExistenteId ? ` por el cliente ${clienteExistenteId}` : ''
      }`,
      { email, clienteExistenteId }
    );
  }
}

export class TelefonoYaRegistradoError extends ClienteError {
  readonly code = 'TELEFONO_YA_REGISTRADO';
  readonly type = 'duplicate' as const;

  constructor(telefono: string, clienteExistenteId?: string) {
    super(
      `El teléfono ${telefono} ya está registrado${
        clienteExistenteId ? ` por el cliente ${clienteExistenteId}` : ''
      }`,
      { telefono, clienteExistenteId }
    );
  }
}

export class ClienteDuplicadoError extends ClienteError {
  readonly code = 'CLIENTE_DUPLICADO';
  readonly type = 'duplicate' as const;

  constructor(criterio: string, valor: string, clienteExistenteId: string) {
    super(`Ya existe un cliente con ${criterio}: ${valor} (ID: ${clienteExistenteId})`, {
      criterio,
      valor,
      clienteExistenteId,
    });
  }
}

// Errores de infraestructura
export class ErrorRepositorioClientesError extends ClienteError {
  readonly code = 'ERROR_REPOSITORIO_CLIENTES';
  readonly type = 'business' as const;

  constructor(operacion: string, error: string, clienteId?: string) {
    super(`Error en repositorio de clientes durante ${operacion}: ${error}`, {
      operacion,
      error,
      clienteId,
    });
  }
}

export class ErrorServicioClientesError extends ClienteError {
  readonly code = 'ERROR_SERVICIO_CLIENTES';
  readonly type = 'business' as const;

  constructor(operacion: string, error: string, clienteId?: string) {
    super(`Error en servicio de clientes durante ${operacion}: ${error}`, {
      operacion,
      error,
      clienteId,
    });
  }
}

export class ErrorValidacionClienteError extends ClienteError {
  readonly code = 'ERROR_VALIDACION_CLIENTE';
  readonly type = 'validation' as const;

  constructor(campo: string, valor: any, regla: string) {
    super(`Error de validación en ${campo}: ${valor}. Regla: ${regla}`, { campo, valor, regla });
  }
}

export class ErrorActualizacionClienteError extends ClienteError {
  readonly code = 'ERROR_ACTUALIZACION_CLIENTE';
  readonly type = 'business' as const;

  constructor(clienteId: string, campo: string, error: string) {
    super(`Error actualizando ${campo} del cliente ${clienteId}: ${error}`, {
      clienteId,
      campo,
      error,
    });
  }
}

export class OperacionNoPermitidaError extends ClienteError {
  readonly code = 'OPERACION_NO_PERMITIDA';
  readonly type = 'business' as const;

  constructor(operacion: string, clienteId: string, motivo: string) {
    super(`Operación ${operacion} no permitida para el cliente ${clienteId}: ${motivo}`, {
      operacion,
      clienteId,
      motivo,
    });
  }
}

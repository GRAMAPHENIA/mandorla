/**
 * Servicio de aplicación para gestión de clientes
 * Proyecto Mandorla - Panadería E-commerce
 */

import {
  ClienteEntity,
  ClienteId,
  Email,
  Telefono,
  Direccion,
  DatosDireccion,
  TipoCliente,
  EstadoCliente,
  PreferenciasCliente,
  EstadisticasCliente,
  IClienteRepository,
  FiltrosClientes,
  OpcionesPaginacionClientes,
  ResultadoPaginadoClientes,
  EstadisticasClientes,
  ClienteNoEncontradoError,
  EmailYaRegistradoError,
  TelefonoYaRegistradoError,
  ClienteNoActivoError,
  ErrorRepositorioClientesError,
  ErrorServicioClientesError,
} from '../../domain';

import {
  CrearClienteDto,
  CrearClienteRespuestaDto,
  ConsultarClientesDto,
  ConsultarClientesRespuestaDto,
  ObtenerClienteDto,
  ClienteDetalleDto,
  ClienteResumenDto,
  EstadisticasClientesDto,
  ActualizarDatosPersonalesDto,
  ActualizarDireccionDto,
  AgregarDireccionDto,
  AgregarDireccionRespuestaDto,
  EliminarDireccionDto,
  EliminarDireccionRespuestaDto,
  EstablecerDireccionPrincipalDto,
  ActualizarPreferenciasDto,
  CambiarTipoClienteDto,
  CambiarTipoClienteRespuestaDto,
  CambiarEstadoClienteDto,
  CambiarEstadoClienteRespuestaDto,
  ActualizarEstadisticasClienteDto,
  RegistrarPedidoClienteDto,
  ActualizarClienteRespuestaDto,
  ActualizarEstadisticasRespuestaDto,
} from '../dtos';

export class ClienteService {
  constructor(private readonly clienteRepository: IClienteRepository) {}

  /**
   * Crea un nuevo cliente
   */
  async crearCliente(datos: CrearClienteDto): Promise<CrearClienteRespuestaDto> {
    try {
      // Validar que el email no esté registrado
      const emailExiste = await this.clienteRepository.existeEmailString(datos.email);
      if (emailExiste) {
        throw new EmailYaRegistradoError(datos.email);
      }

      // Validar que el teléfono no esté registrado
      const telefonoExiste = await this.clienteRepository.existeTelefonoString(datos.telefono);
      if (telefonoExiste) {
        throw new TelefonoYaRegistradoError(datos.telefono);
      }

      // Convertir datos de dirección si se proporciona
      const direccion = datos.direccion ? this.convertirDatosDireccion(datos.direccion) : undefined;

      // Crear entidad de cliente
      const cliente = ClienteEntity.crear(
        datos.nombre,
        datos.apellido,
        datos.email,
        datos.telefono,
        direccion,
        datos.fechaNacimiento ? new Date(datos.fechaNacimiento) : undefined,
        datos.notas
      );

      // Actualizar preferencias si se proporcionan
      if (datos.preferencias) {
        cliente.actualizarPreferencias(datos.preferencias);
      }

      // Guardar en repositorio
      await this.clienteRepository.guardar(cliente);

      // Convertir a DTO de respuesta
      return this.convertirACrearClienteRespuesta(cliente);
    } catch (error) {
      if (error instanceof EmailYaRegistradoError || error instanceof TelefonoYaRegistradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('crear cliente', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene un cliente por su ID
   */
  async obtenerCliente(datos: ObtenerClienteDto): Promise<ClienteDetalleDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      return this.convertirAClienteDetalle(cliente, {
        incluirEstadisticas: datos.incluirEstadisticas,
      });
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('obtener cliente', error.message, datos.clienteId);
      }
      throw error;
    }
  }

  /**
   * Busca un cliente por email
   */
  async buscarClientePorEmail(email: string): Promise<ClienteDetalleDto | null> {
    try {
      const cliente = await this.clienteRepository.buscarPorEmailString(email);

      if (!cliente) {
        return null;
      }

      return this.convertirAClienteDetalle(cliente);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('buscar cliente por email', error.message, email);
      }
      throw error;
    }
  }

  /**
   * Busca un cliente por teléfono
   */
  async buscarClientePorTelefono(telefono: string): Promise<ClienteDetalleDto | null> {
    try {
      const cliente = await this.clienteRepository.buscarPorTelefonoString(telefono);

      if (!cliente) {
        return null;
      }

      return this.convertirAClienteDetalle(cliente);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'buscar cliente por teléfono',
          error.message,
          telefono
        );
      }
      throw error;
    }
  }

  /**
   * Consulta clientes con filtros y paginación
   */
  async consultarClientes(datos: ConsultarClientesDto): Promise<ConsultarClientesRespuestaDto> {
    try {
      // Convertir DTO a filtros de dominio
      const filtros = this.convertirFiltros(datos);
      const opciones = this.convertirOpcionesPaginacion(datos);

      // Consultar repositorio
      const resultado = await this.clienteRepository.buscarConFiltros(filtros, opciones);

      // Convertir a DTO de respuesta
      return this.convertirAConsultarClientesRespuesta(resultado, datos);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('consultar clientes', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene clientes VIP activos
   */
  async obtenerClientesVIP(limite: number = 50): Promise<ClienteResumenDto[]> {
    try {
      const clientes = await this.clienteRepository.obtenerClientesVIP(limite);
      return clientes.map(cliente => this.convertirAClienteResumen(cliente));
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('obtener clientes VIP', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene clientes registrados recientemente
   */
  async obtenerClientesRecientes(
    dias: number = 30,
    limite: number = 20
  ): Promise<ClienteResumenDto[]> {
    try {
      const clientes = await this.clienteRepository.obtenerClientesRecientes(dias, limite);
      return clientes.map(cliente => this.convertirAClienteResumen(cliente));
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('obtener clientes recientes', error.message);
      }
      throw error;
    }
  }

  /**
   * Obtiene clientes inactivos
   */
  async obtenerClientesInactivos(
    diasInactividad: number = 90,
    limite: number = 50
  ): Promise<ClienteResumenDto[]> {
    try {
      const clientes = await this.clienteRepository.obtenerClientesInactivos(
        diasInactividad,
        limite
      );
      return clientes.map(cliente => this.convertirAClienteResumen(cliente));
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('obtener clientes inactivos', error.message);
      }
      throw error;
    }
  }

  /**
   * Actualiza datos personales de un cliente
   */
  async actualizarDatosPersonales(
    datos: ActualizarDatosPersonalesDto
  ): Promise<ActualizarClienteRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      const camposActualizados: string[] = [];

      // Actualizar nombre y apellido si se proporcionan
      if (datos.nombre || datos.apellido) {
        const nombreActual = datos.nombre || cliente.nombre;
        const apellidoActual = datos.apellido || cliente.apellido;
        cliente.actualizarNombre(nombreActual, apellidoActual);

        if (datos.nombre) camposActualizados.push('nombre');
        if (datos.apellido) camposActualizados.push('apellido');
      }

      // Actualizar teléfono si se proporciona
      if (datos.telefono) {
        // Verificar que el nuevo teléfono no esté registrado por otro cliente
        const telefonoExiste = await this.clienteRepository.buscarPorTelefonoString(datos.telefono);
        if (telefonoExiste && !telefonoExiste.id.equals(clienteId)) {
          throw new TelefonoYaRegistradoError(datos.telefono, telefonoExiste.id.value);
        }

        cliente.actualizarTelefono(datos.telefono);
        camposActualizados.push('telefono');
      }

      // Actualizar fecha de nacimiento si se proporciona
      if (datos.fechaNacimiento) {
        cliente.actualizarFechaNacimiento(new Date(datos.fechaNacimiento));
        camposActualizados.push('fechaNacimiento');
      }

      // Guardar cambios
      await this.clienteRepository.guardar(cliente);

      return {
        clienteId: datos.clienteId,
        camposActualizados,
        fechaActualizacion: cliente.fechaUltimaActualizacion.toISOString(),
        mensaje: `Datos personales actualizados exitosamente: ${camposActualizados.join(', ')}`,
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError || error instanceof TelefonoYaRegistradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'actualizar datos personales',
          error.message,
          datos.clienteId
        );
      }
      throw error;
    }
  }

  /**
   * Agrega una nueva dirección a un cliente
   */
  async agregarDireccion(datos: AgregarDireccionDto): Promise<AgregarDireccionRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      const datosDireccion = this.convertirDatosDireccion(datos);
      cliente.agregarDireccion(datosDireccion, datos.esPrincipal);

      await this.clienteRepository.guardar(cliente);

      const direcciones = cliente.direcciones;
      const indiceDireccion = direcciones.length - 1;
      const nuevaDireccion = direcciones[indiceDireccion];

      return {
        clienteId: datos.clienteId,
        indiceDireccion,
        direccion: {
          formateadaCompleta: nuevaDireccion.formatearCompleta(),
          formateadaCorta: nuevaDireccion.formatearCorta(),
          esValidaParaDelivery: nuevaDireccion.esValidaParaDelivery(),
        },
        esPrincipal: cliente.direccionPrincipal?.equals(nuevaDireccion) || false,
        totalDirecciones: direcciones.length,
        fechaActualizacion: cliente.fechaUltimaActualizacion.toISOString(),
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('agregar dirección', error.message, datos.clienteId);
      }
      throw error;
    }
  }

  /**
   * Actualiza una dirección existente
   */
  async actualizarDireccion(datos: ActualizarDireccionDto): Promise<ActualizarClienteRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      const datosDireccion = this.convertirDatosDireccion(datos);
      cliente.actualizarDireccion(datos.indiceDireccion, datosDireccion);

      await this.clienteRepository.guardar(cliente);

      return {
        clienteId: datos.clienteId,
        camposActualizados: ['direccion'],
        fechaActualizacion: cliente.fechaUltimaActualizacion.toISOString(),
        mensaje: `Dirección ${datos.indiceDireccion} actualizada exitosamente`,
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'actualizar dirección',
          error.message,
          datos.clienteId
        );
      }
      throw error;
    }
  }

  /**
   * Elimina una dirección
   */
  async eliminarDireccion(datos: EliminarDireccionDto): Promise<EliminarDireccionRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      const direccionEliminada = cliente.direcciones[datos.indiceDireccion];
      cliente.eliminarDireccion(datos.indiceDireccion);

      await this.clienteRepository.guardar(cliente);

      return {
        clienteId: datos.clienteId,
        direccionEliminada: {
          formateadaCorta: direccionEliminada.formatearCorta(),
        },
        nuevaDireccionPrincipal: cliente.direccionPrincipal
          ? {
              formateadaCorta: cliente.direccionPrincipal.formatearCorta(),
            }
          : undefined,
        totalDirecciones: cliente.direcciones.length,
        fechaActualizacion: cliente.fechaUltimaActualizacion.toISOString(),
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('eliminar dirección', error.message, datos.clienteId);
      }
      throw error;
    }
  }

  /**
   * Establece una dirección como principal
   */
  async establecerDireccionPrincipal(
    datos: EstablecerDireccionPrincipalDto
  ): Promise<ActualizarClienteRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      cliente.establecerDireccionPrincipal(datos.indiceDireccion);

      await this.clienteRepository.guardar(cliente);

      return {
        clienteId: datos.clienteId,
        camposActualizados: ['direccionPrincipal'],
        fechaActualizacion: cliente.fechaUltimaActualizacion.toISOString(),
        mensaje: `Dirección ${datos.indiceDireccion} establecida como principal`,
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'establecer dirección principal',
          error.message,
          datos.clienteId
        );
      }
      throw error;
    }
  }

  /**
   * Actualiza las preferencias de un cliente
   */
  async actualizarPreferencias(
    datos: ActualizarPreferenciasDto
  ): Promise<ActualizarClienteRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      const preferenciasActualizadas: Partial<PreferenciasCliente> = {};

      if (datos.recibirPromociones !== undefined) {
        preferenciasActualizadas.recibirPromociones = datos.recibirPromociones;
      }
      if (datos.recibirNotificacionesPedidos !== undefined) {
        preferenciasActualizadas.recibirNotificacionesPedidos = datos.recibirNotificacionesPedidos;
      }
      if (datos.recibirNewsletters !== undefined) {
        preferenciasActualizadas.recibirNewsletters = datos.recibirNewsletters;
      }
      if (datos.metodoPagoPreferido !== undefined) {
        preferenciasActualizadas.metodoPagoPreferido = datos.metodoPagoPreferido;
      }
      if (datos.tipoEntregaPreferido !== undefined) {
        preferenciasActualizadas.tipoEntregaPreferido = datos.tipoEntregaPreferido;
      }
      if (datos.horarioPreferidoEntrega !== undefined) {
        preferenciasActualizadas.horarioPreferidoEntrega = datos.horarioPreferidoEntrega;
      }
      if (datos.diasPreferidosEntrega !== undefined) {
        preferenciasActualizadas.diasPreferidosEntrega = datos.diasPreferidosEntrega;
      }

      cliente.actualizarPreferencias(preferenciasActualizadas);

      await this.clienteRepository.guardar(cliente);

      return {
        clienteId: datos.clienteId,
        camposActualizados: ['preferencias'],
        fechaActualizacion: cliente.fechaUltimaActualizacion.toISOString(),
        mensaje: 'Preferencias actualizadas exitosamente',
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'actualizar preferencias',
          error.message,
          datos.clienteId
        );
      }
      throw error;
    }
  }

  /**
   * Cambia el tipo de un cliente
   */
  async cambiarTipoCliente(datos: CambiarTipoClienteDto): Promise<CambiarTipoClienteRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      const tipoAnterior = cliente.tipo;
      cliente.cambiarTipo(datos.nuevoTipo as TipoCliente, datos.motivo);

      await this.clienteRepository.guardar(cliente);

      return {
        clienteId: datos.clienteId,
        tipoAnterior,
        tipoNuevo: datos.nuevoTipo,
        motivo: datos.motivo,
        fechaCambio: cliente.fechaUltimaActualizacion.toISOString(),
        beneficiosNuevoTipo: this.obtenerBeneficiosTipo(datos.nuevoTipo as TipoCliente),
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'cambiar tipo cliente',
          error.message,
          datos.clienteId
        );
      }
      throw error;
    }
  }

  /**
   * Cambia el estado de un cliente
   */
  async cambiarEstadoCliente(
    datos: CambiarEstadoClienteDto
  ): Promise<CambiarEstadoClienteRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      const estadoAnterior = cliente.estado;

      // Aplicar cambio de estado según el nuevo estado
      switch (datos.nuevoEstado as EstadoCliente) {
        case EstadoCliente.ACTIVO:
          cliente.activar();
          break;
        case EstadoCliente.INACTIVO:
          cliente.desactivar(datos.motivo);
          break;
        case EstadoCliente.SUSPENDIDO:
          cliente.suspender(datos.motivo || 'Suspendido por administrador');
          break;
        case EstadoCliente.BLOQUEADO:
          cliente.bloquear(datos.motivo || 'Bloqueado por administrador');
          break;
      }

      await this.clienteRepository.guardar(cliente);

      return {
        clienteId: datos.clienteId,
        estadoAnterior,
        estadoNuevo: datos.nuevoEstado,
        motivo: datos.motivo,
        fechaCambio: cliente.fechaUltimaActualizacion.toISOString(),
        puedeRealizarPedidos: cliente.puedeRealizarPedidos(),
        accionesDisponibles: this.obtenerAccionesDisponibles(cliente.estado),
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'cambiar estado cliente',
          error.message,
          datos.clienteId
        );
      }
      throw error;
    }
  }

  /**
   * Registra un nuevo pedido para actualizar estadísticas del cliente
   */
  async registrarPedidoCliente(
    datos: RegistrarPedidoClienteDto
  ): Promise<ActualizarEstadisticasRespuestaDto> {
    try {
      const clienteId = ClienteId.fromString(datos.clienteId);
      const cliente = await this.clienteRepository.buscarPorId(clienteId);

      if (!cliente) {
        throw new ClienteNoEncontradoError(datos.clienteId);
      }

      if (!cliente.puedeRealizarPedidos()) {
        throw new ClienteNoActivoError(datos.clienteId, cliente.estado);
      }

      cliente.registrarNuevoPedido(datos.montoPedido, datos.productos, datos.categorias);

      await this.clienteRepository.guardar(cliente);

      const estadisticas = cliente.estadisticas;

      return {
        clienteId: datos.clienteId,
        estadisticasActualizadas: {
          totalPedidos: estadisticas.totalPedidos,
          totalGastado: estadisticas.totalGastado,
          totalGastadoFormateado: new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }).format(estadisticas.totalGastado),
          promedioGastoPorPedido: estadisticas.promedioGastoPorPedido,
          promedioGastoPorPedidoFormateado: new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }).format(estadisticas.promedioGastoPorPedido),
          ultimoPedido: estadisticas.ultimoPedido?.toISOString(),
          primerPedido: estadisticas.primerPedido?.toISOString(),
          frecuenciaCompra: estadisticas.frecuenciaCompra,
          cantidadProductosFavoritos: estadisticas.productosFavoritos.length,
          cantidadCategoriasFavoritas: estadisticas.categoriasFavoritas.length,
        },
        fechaActualizacion: cliente.fechaUltimaActualizacion.toISOString(),
      };
    } catch (error) {
      if (error instanceof ClienteNoEncontradoError || error instanceof ClienteNoActivoError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ErrorServicioClientesError(
          'registrar pedido cliente',
          error.message,
          datos.clienteId
        );
      }
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de clientes
   */
  async obtenerEstadisticas(
    fechaDesde?: Date,
    fechaHasta?: Date
  ): Promise<EstadisticasClientesDto> {
    try {
      const estadisticas = await this.clienteRepository.obtenerEstadisticas(fechaDesde, fechaHasta);
      return this.convertirAEstadisticasDto(estadisticas, fechaDesde, fechaHasta);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrorServicioClientesError('obtener estadísticas', error.message);
      }
      throw error;
    }
  }

  // Métodos privados de conversión y utilidades

  private convertirDatosDireccion(datos: any): DatosDireccion {
    return {
      calle: datos.calle,
      numero: datos.numero,
      piso: datos.piso,
      departamento: datos.departamento,
      ciudad: datos.ciudad,
      provincia: datos.provincia,
      codigoPostal: datos.codigoPostal,
      pais: datos.pais || 'Argentina',
      referencias: datos.referencias,
      entreCalles: datos.entreCalles,
    };
  }

  private convertirFiltros(dto: ConsultarClientesDto): FiltrosClientes {
    return {
      nombre: dto.nombre,
      apellido: dto.apellido,
      email: dto.email,
      telefono: dto.telefono,
      tipo: dto.tipo as TipoCliente,
      estado: dto.estado as EstadoCliente,
      ciudad: dto.ciudad,
      provincia: dto.provincia,
      fechaRegistroDesde: dto.fechaRegistroDesde ? new Date(dto.fechaRegistroDesde) : undefined,
      fechaRegistroHasta: dto.fechaRegistroHasta ? new Date(dto.fechaRegistroHasta) : undefined,
      edadMinima: dto.edadMinima,
      edadMaxima: dto.edadMaxima,
      esVIP: dto.esVIP,
      tieneMultiplesDirecciones: dto.tieneMultiplesDirecciones,
      recibirPromociones: dto.recibirPromociones,
    };
  }

  private convertirOpcionesPaginacion(dto: ConsultarClientesDto): OpcionesPaginacionClientes {
    return {
      pagina: dto.pagina || 1,
      limite: dto.limite || 10,
      ordenarPor: dto.ordenarPor || 'fechaRegistro',
      direccion: dto.direccion || 'DESC',
    };
  }

  private convertirACrearClienteRespuesta(cliente: ClienteEntity): CrearClienteRespuestaDto {
    const json = cliente.toJSON();

    return {
      clienteId: json.id,
      nombre: json.nombre,
      apellido: json.apellido,
      nombreCompleto: json.nombreCompleto,
      email: json.email,
      telefono: json.telefono,
      direccion: json.direccionPrincipal,
      fechaNacimiento: json.fechaNacimiento,
      edad: json.edad,
      tipo: json.tipo,
      estado: json.estado,
      preferencias: json.preferencias,
      fechaRegistro: json.fechaRegistro,
      esMayorDeEdad: json.esMayorDeEdad,
      puedeRealizarPedidos: json.puedeRealizarPedidos,
      resumen: json.resumen,
    };
  }

  private convertirAClienteDetalle(
    cliente: ClienteEntity,
    opciones?: { incluirEstadisticas?: boolean }
  ): ClienteDetalleDto {
    const json = cliente.toJSON();

    return {
      id: json.id,
      nombre: json.nombre,
      apellido: json.apellido,
      nombreCompleto: json.nombreCompleto,
      email: json.email,
      telefono: json.telefono,
      direcciones: json.direcciones,
      direccionPrincipal: json.direccionPrincipal,
      fechaNacimiento: json.fechaNacimiento,
      edad: json.edad,
      tipo: json.tipo,
      estado: json.estado,
      preferencias: json.preferencias,
      estadisticas: opciones?.incluirEstadisticas ? json.estadisticas : undefined,
      fechaRegistro: json.fechaRegistro,
      fechaUltimaActualizacion: json.fechaUltimaActualizacion,
      notas: json.notas,
      estaActivo: json.estaActivo,
      esVIP: json.esVIP,
      puedeRealizarPedidos: json.puedeRealizarPedidos,
      esMayorDeEdad: json.esMayorDeEdad,
      tieneDireccionValidaParaDelivery: json.tieneDireccionValidaParaDelivery,
      tieneMultiplesDirecciones: json.tieneMultiplesDirecciones,
      resumen: json.resumen,
      informacionContacto: json.informacionContacto,
    };
  }

  private convertirAClienteResumen(cliente: ClienteEntity): ClienteResumenDto {
    const json = cliente.toJSON();

    return {
      id: json.id,
      nombre: json.nombre,
      apellido: json.apellido,
      nombreCompleto: json.nombreCompleto,
      email: json.email,
      telefono: {
        value: json.telefono.value,
        formateado: json.telefono.formateado,
        esCelular: json.telefono.esCelular,
      },
      direccionPrincipal: json.direccionPrincipal
        ? {
            formateadaCorta: json.direccionPrincipal.formateadaCorta,
            ciudad: json.direccionPrincipal.ciudad,
            provincia: json.direccionPrincipal.provincia,
          }
        : undefined,
      edad: json.edad,
      tipo: json.tipo,
      estado: json.estado,
      fechaRegistro: json.fechaRegistro,
      fechaUltimaActualizacion: json.fechaUltimaActualizacion,
      estadisticas: {
        totalPedidos: json.estadisticas.totalPedidos,
        totalGastado: json.estadisticas.totalGastado,
        ultimoPedido: json.estadisticas.ultimoPedido?.toISOString(),
        frecuenciaCompra: json.estadisticas.frecuenciaCompra,
      },
      estaActivo: json.estaActivo,
      esVIP: json.esVIP,
      puedeRealizarPedidos: json.puedeRealizarPedidos,
    };
  }

  private convertirAConsultarClientesRespuesta(
    resultado: ResultadoPaginadoClientes<ClienteEntity>,
    filtrosOriginales: ConsultarClientesDto
  ): ConsultarClientesRespuestaDto {
    return {
      clientes: resultado.items.map(cliente => this.convertirAClienteResumen(cliente)),
      paginacion: {
        pagina: resultado.pagina,
        limite: resultado.limite,
        total: resultado.total,
        totalPaginas: resultado.totalPaginas,
        tieneSiguiente: resultado.tieneSiguiente,
        tieneAnterior: resultado.tieneAnterior,
      },
      filtrosAplicados: {
        nombre: filtrosOriginales.nombre,
        apellido: filtrosOriginales.apellido,
        email: filtrosOriginales.email,
        tipo: filtrosOriginales.tipo,
        estado: filtrosOriginales.estado,
        ciudad: filtrosOriginales.ciudad,
        provincia: filtrosOriginales.provincia,
        rangoFechas:
          filtrosOriginales.fechaRegistroDesde || filtrosOriginales.fechaRegistroHasta
            ? {
                desde: filtrosOriginales.fechaRegistroDesde,
                hasta: filtrosOriginales.fechaRegistroHasta,
              }
            : undefined,
        rangoEdad:
          filtrosOriginales.edadMinima || filtrosOriginales.edadMaxima
            ? {
                minima: filtrosOriginales.edadMinima,
                maxima: filtrosOriginales.edadMaxima,
              }
            : undefined,
        esVIP: filtrosOriginales.esVIP,
      },
    };
  }

  private convertirAEstadisticasDto(
    estadisticas: EstadisticasClientes,
    fechaDesde?: Date,
    fechaHasta?: Date
  ): EstadisticasClientesDto {
    return {
      periodo: {
        fechaDesde: fechaDesde?.toISOString(),
        fechaHasta: fechaHasta?.toISOString(),
      },
      resumen: {
        totalClientes: estadisticas.totalClientes,
        clientesActivos: estadisticas.clientesPorEstado[EstadoCliente.ACTIVO] || 0,
        clientesVIP: estadisticas.clientesPorTipo[TipoCliente.VIP] || 0,
        clientesRegistradosUltimoMes: estadisticas.clientesRegistradosUltimoMes,
        clientesActivosUltimoMes: estadisticas.clientesActivosUltimoMes,
        edadPromedio: estadisticas.edadPromedio,
        tasaRetencion: estadisticas.tasaRetencion,
      },
      clientesPorTipo: Object.entries(estadisticas.clientesPorTipo).map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
        porcentaje:
          estadisticas.totalClientes > 0 ? (cantidad / estadisticas.totalClientes) * 100 : 0,
      })),
      clientesPorEstado: Object.entries(estadisticas.clientesPorEstado).map(
        ([estado, cantidad]) => ({
          estado,
          cantidad,
          porcentaje:
            estadisticas.totalClientes > 0 ? (cantidad / estadisticas.totalClientes) * 100 : 0,
        })
      ),
      distribucionGeografica: {
        porCiudad: estadisticas.distribucionPorCiudad.map(item => ({
          ciudad: item.ciudad,
          cantidad: item.cantidad,
          porcentaje:
            estadisticas.totalClientes > 0 ? (item.cantidad / estadisticas.totalClientes) * 100 : 0,
        })),
        porProvincia: estadisticas.distribucionPorProvincia.map(item => ({
          provincia: item.provincia,
          cantidad: item.cantidad,
          porcentaje:
            estadisticas.totalClientes > 0 ? (item.cantidad / estadisticas.totalClientes) * 100 : 0,
        })),
      },
      clientesDestacados: {
        conMasPedidos: estadisticas.clientesConMasPedidos.map(cliente => ({
          clienteId: cliente.clienteId,
          nombre: cliente.nombre,
          email: cliente.email,
          totalPedidos: cliente.totalPedidos,
          totalGastado: cliente.totalGastado,
          totalGastadoFormateado: new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }).format(cliente.totalGastado),
        })),
        vipMasActivos: estadisticas.clientesVIPMasActivos.map(cliente => ({
          clienteId: cliente.clienteId,
          nombre: cliente.nombre,
          email: cliente.email,
          ultimoPedido: cliente.ultimoPedido.toISOString(),
          diasSinPedido: Math.floor(
            (new Date().getTime() - cliente.ultimoPedido.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })),
      },
      segmentacion: {
        nuevosVsRecurrentes: {
          nuevos: estadisticas.clientesNuevosVsRecurrentes.nuevos,
          recurrentes: estadisticas.clientesNuevosVsRecurrentes.recurrentes,
          porcentajeNuevos:
            estadisticas.totalClientes > 0
              ? (estadisticas.clientesNuevosVsRecurrentes.nuevos / estadisticas.totalClientes) * 100
              : 0,
          porcentajeRecurrentes:
            estadisticas.totalClientes > 0
              ? (estadisticas.clientesNuevosVsRecurrentes.recurrentes /
                  estadisticas.totalClientes) *
                100
              : 0,
        },
        porFrecuenciaCompra: {
          alta: 0, // Se calcularía con datos reales
          media: 0,
          baja: 0,
        },
      },
    };
  }

  private obtenerBeneficiosTipo(tipo: TipoCliente): string[] {
    const beneficios: Record<TipoCliente, string[]> = {
      [TipoCliente.REGULAR]: ['Acceso a promociones regulares', 'Programa de puntos básico'],
      [TipoCliente.VIP]: [
        'Descuentos exclusivos del 15%',
        'Envío gratuito en todos los pedidos',
        'Acceso prioritario a productos nuevos',
        'Atención personalizada',
      ],
      [TipoCliente.MAYORISTA]: [
        'Descuentos por volumen',
        'Precios especiales para reventa',
        'Términos de pago extendidos',
      ],
      [TipoCliente.CORPORATIVO]: [
        'Facturación empresarial',
        'Descuentos corporativos',
        'Gestión de múltiples direcciones',
        'Reportes de consumo',
      ],
    };

    return beneficios[tipo] || [];
  }

  private obtenerAccionesDisponibles(estado: EstadoCliente): string[] {
    const acciones: Record<EstadoCliente, string[]> = {
      [EstadoCliente.ACTIVO]: [
        'Realizar pedidos',
        'Actualizar información',
        'Cambiar preferencias',
        'Suspender cuenta',
        'Desactivar cuenta',
      ],
      [EstadoCliente.INACTIVO]: ['Activar cuenta', 'Actualizar información'],
      [EstadoCliente.SUSPENDIDO]: ['Activar cuenta', 'Bloquear cuenta'],
      [EstadoCliente.BLOQUEADO]: ['Activar cuenta'],
    };

    return acciones[estado] || [];
  }
}

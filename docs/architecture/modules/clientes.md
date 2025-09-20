# Módulo Clientes - Arquitectura Hexagonal

## Descripción

El módulo de clientes gestiona toda la información relacionada con los clientes de la panadería Mandorla, incluyendo datos personales, direcciones, historial de compras y preferencias.

## Diagrama de Arquitectura del Módulo

```mermaid
graph TB
    subgraph "Módulo Clientes"
        subgraph "Domain"
            CE[ClienteEntity]
            CID[ClienteId]
            EM[Email]
            TEL[Telefono]
            DIR[Direccion]
            EST[EstadisticasCliente]
            ICR[IClienteRepository]
            ERR[ClienteErrors]
        end
        
        subgraph "Application"
            CS[ClienteService]
            DTO[ClienteDTOs]
            INT[ServiceInterfaces]
        end
        
        subgraph "Infrastructure"
            CR[ClienteRepository]
            ADP[ClienteAdapters]
            MAP[ClienteMappers]
       
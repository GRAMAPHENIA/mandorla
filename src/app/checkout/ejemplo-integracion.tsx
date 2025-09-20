/**
 * Ejemplo de integración del sistema de checkout
 * Proyecto Mandorla - Panadería E-commerce
 */

'use client';

import React from 'react';
import { CheckoutForm } from '../../modules/checkout/presentation/components/CheckoutForm';
import { CheckoutFacade, CheckoutIntegrationService } from '../../modules/checkout';

// Simulación de dependencias (en una app real vendrían de un container de DI)
const mockPedidoRepository = {} as any;
const mockClienteRepository = {} as any;
const mockPagoService = {} as any;

// Crear instancias de los servicios
const checkoutIntegrationService = new CheckoutIntegrationService(
    mockPedidoRepository,
    mockClienteRepository,
    mockPagoService
);

const checkoutFacade = new CheckoutFacade(checkoutIntegrationService);

// Datos de ejemplo
const clienteEjemplo = 'CLI-123456789';
const itemsEjemplo = [
    {
        productoId: 'PROD-001',
        nombre: 'Pan Integral',
        precio: 2500,
        categoria: 'panes',
        cantidad: 2,
        descripcion: 'Pan integral artesanal',
        imagen: '/images/pan-integral.jpg'
    },
    {
        productoId: 'PROD-002',
        nombre: 'Croissants de Mantequilla',
        precio: 1200,
        categoria: 'pasteles',
        cantidad: 4,
        descripcion: 'Croissants frescos de mantequilla'
    }
];

export default function EjemploIntegracion() {
    const handleSuccess = (resultado: any) => {
        console.log('Checkout exitoso:', resultado);

        // Redirigir según el método de pago
        if (resultado.pago) {
            // Para Mercado Pago, redirigir al init_point
            window.location.href = resultado.pago.initPoint;
        } else {
            // Para otros métodos, mostrar confirmación
            alert(`¡Pedido confirmado! ID: ${resultado.pedidoId}`);
        }
    };

    const handleError = (error: string) => {
        console.error('Error en checkout:', error);
        alert(`Error: ${error}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Ejemplo de Integración - Checkout
                    </h1>
                    <p className="text-gray-600">
                        Demostración del sistema integrado de pedidos y clientes
                    </p>
                </div>

                <CheckoutForm
                    checkoutFacade={checkoutFacade}
                    clienteId={clienteEjemplo}
                    items={itemsEjemplo}
                    onSuccess={handleSuccess}
                    onError={handleError}
                />

                {/* Información adicional */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Características de la Integración
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                🔗 Módulos Integrados
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Módulo de Clientes</li>
                                <li>• Módulo de Pedidos</li>
                                <li>• Integración con Mercado Pago</li>
                                <li>• Validaciones de negocio</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                ⚡ Funcionalidades
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Validación de cliente</li>
                                <li>• Cálculo automático de envío</li>
                                <li>• Múltiples métodos de pago</li>
                                <li>• Actualización de estadísticas</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                🏗️ Arquitectura
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Principios SOLID</li>
                                <li>• Arquitectura hexagonal</li>
                                <li>• Separación de responsabilidades</li>
                                <li>• Facades para UI</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <h3 className="font-semibold text-amber-800 mb-2">
                            📝 Nota de Implementación
                        </h3>
                        <p className="text-amber-700 text-sm">
                            Este es un ejemplo de integración que demuestra cómo los módulos de pedidos y clientes
                            trabajan juntos. En una implementación real, las dependencias se inyectarían a través
                            de un container de inversión de dependencias y los repositorios tendrían implementaciones
                            concretas conectadas a una base de datos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
/**
 * Componente de formulario de checkout integrado
 * Proyecto Mandorla - Panadería E-commerce
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useCheckout, CheckoutFacade, CheckoutRequest } from '../index';

interface CheckoutFormProps {
    checkoutFacade: CheckoutFacade;
    clienteId: string;
    items: Array<{
        productoId: string;
        nombre: string;
        precio: number;
        categoria: string;
        cantidad: number;
        descripcion?: string;
        imagen?: string;
    }>;
    onSuccess?: (resultado: any) => void;
    onError?: (error: string) => void;
}

export function CheckoutForm({
    checkoutFacade,
    clienteId,
    items,
    onSuccess,
    onError
}: CheckoutFormProps) {
    const {
        loading,
        error,
        success,
        resultado,
        procesarCheckout,
        validarCliente,
        calcularCostoEnvio,
        obtenerMetodosPago,
        obtenerOpcionesEntrega,
        limpiarEstado
    } = useCheckout(checkoutFacade);

    const [formData, setFormData] = useState({
        tipoEntrega: 'RETIRO_LOCAL' as 'RETIRO_LOCAL' | 'DELIVERY',
        metodoPago: 'MERCADO_PAGO' as 'MERCADO_PAGO' | 'EFECTIVO' | 'TRANSFERENCIA',
        direccion: {
            calle: '',
            numero: '',
            piso: '',
            departamento: '',
            ciudad: '',
            provincia: '',
            codigoPostal: '',
            referencias: ''
        },
        instrucciones: '',
        notas: ''
    });

    const [costoEnvio, setCostoEnvio] = useState(0);
    const [clienteValido, setClienteValido] = useState(false);
    const [validandoCliente, setValidandoCliente] = useState(true);

    const metodosPago = obtenerMetodosPago();
    const opcionesEntrega = obtenerOpcionesEntrega();

    // Validar cliente al montar el componente
    useEffect(() => {
        const validar = async () => {
            try {
                const resultado = await validarCliente(clienteId);
                setClienteValido(resultado.puedeRealizarPedidos);
                if (!resultado.puedeRealizarPedidos && onError) {
                    onError(resultado.motivo || 'Cliente no puede realizar pedidos');
                }
            } catch (err) {
                setClienteValido(false);
                if (onError) {
                    onError('Error validando cliente');
                }
            } finally {
                setValidandoCliente(false);
            }
        };

        validar();
    }, [clienteId, validarCliente, onError]);

    // Calcular costo de envío cuando cambia la dirección
    useEffect(() => {
        if (formData.tipoEntrega === 'DELIVERY' && formData.direccion.ciudad && formData.direccion.provincia) {
            const calcular = async () => {
                try {
                    const resultado = await calcularCostoEnvio({
                        ciudad: formData.direccion.ciudad,
                        provincia: formData.direccion.provincia
                    });
                    setCostoEnvio(resultado.costo);
                } catch (err) {
                    console.error('Error calculando costo de envío:', err);
                }
            };

            calcular();
        } else {
            setCostoEnvio(0);
        }
    }, [formData.tipoEntrega, formData.direccion.ciudad, formData.direccion.provincia, calcularCostoEnvio]);

    // Manejar éxito del checkout
    useEffect(() => {
        if (success && resultado && onSuccess) {
            onSuccess(resultado);
        }
    }, [success, resultado, onSuccess]);

    // Manejar errores
    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    const calcularSubtotal = () => {
        return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    };

    const calcularTotal = () => {
        return calcularSubtotal() + costoEnvio;
    };

    const formatearMonto = (monto: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clienteValido) {
            if (onError) onError('Cliente no válido para realizar pedidos');
            return;
        }

        const request: CheckoutRequest = {
            clienteId,
            items,
            tipoEntrega: formData.tipoEntrega,
            direccionEntrega: formData.tipoEntrega === 'DELIVERY' ? formData.direccion : undefined,
            metodoPago: formData.metodoPago,
            costoEnvio,
            instrucciones: formData.instrucciones,
            notas: formData.notas
        };

        try {
            await procesarCheckout(request);
        } catch (err) {
            // El error ya se maneja en el hook
            console.error('Error en checkout:', err);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        if (field.startsWith('direccion.')) {
            const direccionField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                direccion: {
                    ...prev.direccion,
                    [direccionField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    if (validandoCliente) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Validando cliente...</p>
                </div>
            </div>
        );
    }

    if (!clienteValido) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">No se puede procesar el pedido</h3>
                <p className="text-red-600">El cliente no está habilitado para realizar pedidos.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Finalizar Pedido</h2>

            {/* Resumen del pedido */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span>{item.cantidad}x {item.nombre}</span>
                            <span>{formatearMonto(item.precio * item.cantidad)}</span>
                        </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>{formatearMonto(calcularSubtotal())}</span>
                        </div>
                        {costoEnvio > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Envío:</span>
                                <span>{formatearMonto(costoEnvio)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                            <span>Total:</span>
                            <span>{formatearMonto(calcularTotal())}</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de entrega */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de Entrega
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {opcionesEntrega.map((opcion) => (
                            <label
                                key={opcion.id}
                                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${formData.tipoEntrega === opcion.id
                                        ? 'border-amber-600 bg-amber-50'
                                        : 'border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="tipoEntrega"
                                    value={opcion.id}
                                    checked={formData.tipoEntrega === opcion.id}
                                    onChange={(e) => handleInputChange('tipoEntrega', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex flex-col">
                                    <span className="block text-sm font-medium text-gray-900">
                                        {opcion.nombre}
                                    </span>
                                    <span className="block text-sm text-gray-500">
                                        {opcion.descripcion}
                                    </span>
                                    <span className="block text-xs text-gray-400 mt-1">
                                        {opcion.tiempoEstimado}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Dirección de entrega (solo para delivery) */}
                {formData.tipoEntrega === 'DELIVERY' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Dirección de Entrega</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Calle *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion.calle}
                                    onChange={(e) => handleInputChange('direccion.calle', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion.numero}
                                    onChange={(e) => handleInputChange('direccion.numero', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ciudad *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion.ciudad}
                                    onChange={(e) => handleInputChange('direccion.ciudad', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Provincia *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion.provincia}
                                    onChange={(e) => handleInputChange('direccion.provincia', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código Postal *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.direccion.codigoPostal}
                                    onChange={(e) => handleInputChange('direccion.codigoPostal', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Referencias
                                </label>
                                <input
                                    type="text"
                                    value={formData.direccion.referencias}
                                    onChange={(e) => handleInputChange('direccion.referencias', e.target.value)}
                                    placeholder="Ej: Portero, timbre, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Método de pago */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Método de Pago
                    </label>
                    <div className="space-y-3">
                        {metodosPago.map((metodo) => (
                            <label
                                key={metodo.id}
                                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${formData.metodoPago === metodo.id
                                        ? 'border-amber-600 bg-amber-50'
                                        : 'border-gray-300'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    value={metodo.id}
                                    checked={formData.metodoPago === metodo.id}
                                    onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                                    className="sr-only"
                                />
                                <div className="flex flex-col">
                                    <span className="block text-sm font-medium text-gray-900">
                                        {metodo.nombre}
                                    </span>
                                    <span className="block text-sm text-gray-500">
                                        {metodo.descripcion}
                                    </span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Instrucciones adicionales */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instrucciones Adicionales
                    </label>
                    <textarea
                        value={formData.instrucciones}
                        onChange={(e) => handleInputChange('instrucciones', e.target.value)}
                        rows={3}
                        placeholder="Instrucciones especiales para la entrega..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                {/* Botón de envío */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-md font-medium text-white ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500'
                            }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Procesando...
                            </div>
                        ) : (
                            `Confirmar Pedido - ${formatearMonto(calcularTotal())}`
                        )}
                    </button>
                </div>
            </form>

            {/* Mensajes de estado */}
            {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {success && resultado && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-600 font-medium">{resultado.mensaje}</p>
                    {resultado.pago && (
                        <div className="mt-2">
                            <a
                                href={resultado.pago.initPoint}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Proceder al Pago
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
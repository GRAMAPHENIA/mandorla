import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioCheckout } from '../../../presentation/components/FormularioCheckout';
import { CheckoutFacade } from '../../../presentation/facades/checkout.facade';
import { MetodoPago } from '../../../domain/types/checkout.types';
import { createMockCarrito, createMockCliente } from '../../setup';

// Mock del CheckoutFacade
jest.mock('../../../presentation/facades/checkout.facade');

// Mock de react-hot-toast
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(),
        dismiss: jest.fn()
    }
}));

// Mock de Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        query: {},
        pathname: '/checkout'
    })
}));

describe('FormularioCheckout', () => {
    let mockCheckoutFacade: jest.Mocked<CheckoutFacade>;
    const user = userEvent.setup();

    const propsDefault = {
        carritoId: 'carrito-test-456',
        clienteId: 'cliente-test-123',
        onCheckoutCompleto: jest.fn(),
        onError: jest.fn()
    };

    beforeEach(() => {
        mockCheckoutFacade = {
            obtenerResumenCheckout: jest.fn(),
            validarDatosCheckout: jest.fn(),
            iniciarCheckout: jest.fn(),
            obtenerMetodosPagoDisponibles: jest.fn()
        } as any;

        (CheckoutFacade as jest.MockedClass<typeof CheckoutFacade>).mockImplementation(() => mockCheckoutFacade);

        // Configurar respuestas por defecto
        mockCheckoutFacade.obtenerResumenCheckout.mockResolvedValue({
            success: true,
            data: {
                items: createMockCarrito().items,
                subtotal: 5500,
                descuentos: 0,
                impuestos: 440,
                total: 5940
            }
        });

        mockCheckoutFacade.obtenerMetodosPagoDisponibles.mockResolvedValue({
            success: true,
            data: {
                metodos: [
                    {
                        id: 'efectivo',
                        nombre: 'Efectivo',
                        descripcion: 'Pago en efectivo al recibir el pedido',
                        disponible: true
                    },
                    {
                        id: 'tarjeta_credito',
                        nombre: 'Tarjeta de Crédito',
                        descripcion: 'Pago con tarjeta de crédito',
                        disponible: true
                    }
                ]
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Renderizado inicial', () => {
        it('debería renderizar el formulario correctamente', async () => {
            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Finalizar Compra')).toBeInTheDocument();
                expect(screen.getByText('Datos de Entrega')).toBeInTheDocument();
                expect(screen.getByText('Método de Pago')).toBeInTheDocument();
                expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
            });
        });

        it('debería cargar el resumen del carrito al inicializar', async () => {
            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            await waitFor(() => {
                expect(mockCheckoutFacade.obtenerResumenCheckout).toHaveBeenCalledWith('carrito-test-456');
            });
        });

        it('debería cargar los métodos de pago disponibles', async () => {
            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            await waitFor(() => {
                expect(mockCheckoutFacade.obtenerMetodosPagoDisponibles).toHaveBeenCalled();
            });
        });

        it('debería mostrar loading mientras carga los datos', () => {
            // Arrange
            mockCheckoutFacade.obtenerResumenCheckout.mockImplementation(
                () => new Promise(resolve => setTimeout(resolve, 1000))
            );

            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            expect(screen.getByText('Cargando...')).toBeInTheDocument();
        });
    });

    describe('Formulario de datos de entrega', () => {
        it('debería permitir completar los datos de entrega', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
            });

            // Act
            await user.type(screen.getByLabelText('Dirección'), 'Av. Corrientes 1234');
            await user.type(screen.getByLabelText('Ciudad'), 'Buenos Aires');
            await user.type(screen.getByLabelText('Código Postal'), '1043');
            await user.type(screen.getByLabelText('Teléfono'), '+54911234567');
            await user.type(screen.getByLabelText('Instrucciones de entrega'), 'Timbre 2B');

            // Assert
            expect(screen.getByDisplayValue('Av. Corrientes 1234')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Buenos Aires')).toBeInTheDocument();
            expect(screen.getByDisplayValue('1043')).toBeInTheDocument();
            expect(screen.getByDisplayValue('+54911234567')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Timbre 2B')).toBeInTheDocument();
        });

        it('debería validar campos requeridos de entrega', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Procesar Pedido' })).toBeInTheDocument();
            });

            // Act - Intentar enviar sin completar campos
            await user.click(screen.getByRole('button', { name: 'Procesar Pedido' }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText('La dirección es requerida')).toBeInTheDocument();
                expect(screen.getByText('La ciudad es requerida')).toBeInTheDocument();
                expect(screen.getByText('El código postal es requerido')).toBeInTheDocument();
                expect(screen.getByText('El teléfono es requerido')).toBeInTheDocument();
            });
        });

        it('debería validar formato de código postal', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Código Postal')).toBeInTheDocument();
            });

            // Act
            await user.type(screen.getByLabelText('Código Postal'), '123'); // Código inválido

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Código postal debe tener 4 dígitos')).toBeInTheDocument();
            });
        });

        it('debería validar formato de teléfono', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
            });

            // Act
            await user.type(screen.getByLabelText('Teléfono'), '123456'); // Teléfono inválido

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Formato de teléfono inválido')).toBeInTheDocument();
            });
        });
    });

    describe('Selección de método de pago', () => {
        it('debería mostrar métodos de pago disponibles', async () => {
            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Efectivo')).toBeInTheDocument();
                expect(screen.getByText('Tarjeta de Crédito')).toBeInTheDocument();
            });
        });

        it('debería permitir seleccionar método de pago', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Tarjeta de Crédito')).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByLabelText('Tarjeta de Crédito'));

            // Assert
            expect(screen.getByLabelText('Tarjeta de Crédito')).toBeChecked();
        });

        it('debería mostrar campos de tarjeta cuando se selecciona pago con tarjeta', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Tarjeta de Crédito')).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByLabelText('Tarjeta de Crédito'));

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText('Número de Tarjeta')).toBeInTheDocument();
                expect(screen.getByLabelText('Vencimiento')).toBeInTheDocument();
                expect(screen.getByLabelText('CVV')).toBeInTheDocument();
                expect(screen.getByLabelText('Titular de la Tarjeta')).toBeInTheDocument();
            });
        });

        it('debería validar datos de tarjeta', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Tarjeta de Crédito')).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText('Tarjeta de Crédito'));

            await waitFor(() => {
                expect(screen.getByLabelText('Número de Tarjeta')).toBeInTheDocument();
            });

            // Act
            await user.type(screen.getByLabelText('Número de Tarjeta'), '1234'); // Número inválido
            await user.type(screen.getByLabelText('Vencimiento'), '13/25'); // Mes inválido
            await user.type(screen.getByLabelText('CVV'), '12'); // CVV inválido

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Número de tarjeta inválido')).toBeInTheDocument();
                expect(screen.getByText('Fecha de vencimiento inválida')).toBeInTheDocument();
                expect(screen.getByText('CVV debe tener 3 dígitos')).toBeInTheDocument();
            });
        });
    });

    describe('Resumen del pedido', () => {
        it('debería mostrar el resumen del carrito', async () => {
            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Croissants de Mantequilla')).toBeInTheDocument();
                expect(screen.getByText('Pan Integral')).toBeInTheDocument();
                expect(screen.getByText('$5.500')).toBeInTheDocument(); // Subtotal
                expect(screen.getByText('$440')).toBeInTheDocument(); // Impuestos
                expect(screen.getByText('$5.940')).toBeInTheDocument(); // Total
            });
        });

        it('debería mostrar descuentos si los hay', async () => {
            // Arrange
            mockCheckoutFacade.obtenerResumenCheckout.mockResolvedValue({
                success: true,
                data: {
                    items: createMockCarrito().items,
                    subtotal: 5500,
                    descuentos: 825, // 15% descuento VIP
                    impuestos: 374,
                    total: 5049
                }
            });

            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('-$825')).toBeInTheDocument(); // Descuento
                expect(screen.getByText('$5.049')).toBeInTheDocument(); // Total con descuento
            });
        });
    });

    describe('Procesamiento del checkout', () => {
        const completarFormulario = async () => {
            await waitFor(() => {
                expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText('Dirección'), 'Av. Corrientes 1234');
            await user.type(screen.getByLabelText('Ciudad'), 'Buenos Aires');
            await user.type(screen.getByLabelText('Código Postal'), '1043');
            await user.type(screen.getByLabelText('Teléfono'), '+54911234567');
            await user.click(screen.getByLabelText('Efectivo'));
        };

        it('debería procesar checkout exitosamente', async () => {
            // Arrange
            mockCheckoutFacade.iniciarCheckout.mockResolvedValue({
                success: true,
                data: {
                    pedidoId: 'pedido-789',
                    pagoId: 'pago-101',
                    total: 5940,
                    transaccionId: 'mp-12345',
                    mensaje: 'Checkout procesado exitosamente'
                }
            });

            render(<FormularioCheckout {...propsDefault} />);

            // Act
            await completarFormulario();
            await user.click(screen.getByRole('button', { name: 'Procesar Pedido' }));

            // Assert
            await waitFor(() => {
                expect(mockCheckoutFacade.iniciarCheckout).toHaveBeenCalledWith({
                    clienteId: 'cliente-test-123',
                    carritoId: 'carrito-test-456',
                    metodoPago: 'efectivo',
                    datosEntrega: {
                        direccion: 'Av. Corrientes 1234',
                        ciudad: 'Buenos Aires',
                        codigoPostal: '1043',
                        telefono: '+54911234567',
                        instrucciones: ''
                    }
                });
            });

            expect(propsDefault.onCheckoutCompleto).toHaveBeenCalledWith({
                pedidoId: 'pedido-789',
                pagoId: 'pago-101',
                total: 5940,
                transaccionId: 'mp-12345',
                mensaje: 'Checkout procesado exitosamente'
            });
        });

        it('debería manejar error en el checkout', async () => {
            // Arrange
            mockCheckoutFacade.iniciarCheckout.mockResolvedValue({
                success: false,
                error: {
                    code: 'CARRITO_VACIO',
                    message: 'El carrito está vacío',
                    type: 'validation'
                }
            });

            render(<FormularioCheckout {...propsDefault} />);

            // Act
            await completarFormulario();
            await user.click(screen.getByRole('button', { name: 'Procesar Pedido' }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText('El carrito está vacío')).toBeInTheDocument();
            });

            expect(propsDefault.onError).toHaveBeenCalledWith({
                code: 'CARRITO_VACIO',
                message: 'El carrito está vacío',
                type: 'validation'
            });
        });

        it('debería mostrar loading durante el procesamiento', async () => {
            // Arrange
            mockCheckoutFacade.iniciarCheckout.mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({
                    success: true,
                    data: { pedidoId: 'test', pagoId: 'test', total: 5940, mensaje: 'OK' }
                }), 1000))
            );

            render(<FormularioCheckout {...propsDefault} />);

            // Act
            await completarFormulario();
            await user.click(screen.getByRole('button', { name: 'Procesar Pedido' }));

            // Assert
            expect(screen.getByText('Procesando...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Procesando...' })).toBeDisabled();
        });
    });

    describe('Cliente invitado', () => {
        it('debería mostrar campos de cliente cuando no hay clienteId', async () => {
            // Arrange
            const propsInvitado = { ...propsDefault, clienteId: undefined };

            // Act
            render(<FormularioCheckout {...propsInvitado} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Datos del Cliente')).toBeInTheDocument();
                expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument();
                expect(screen.getByLabelText('Email')).toBeInTheDocument();
                expect(screen.getByLabelText('Teléfono de Contacto')).toBeInTheDocument();
            });
        });

        it('debería validar datos de cliente invitado', async () => {
            // Arrange
            const propsInvitado = { ...propsDefault, clienteId: undefined };
            render(<FormularioCheckout {...propsInvitado} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Procesar Pedido' })).toBeInTheDocument();
            });

            // Act - Intentar enviar sin completar datos de cliente
            await user.click(screen.getByRole('button', { name: 'Procesar Pedido' }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
                expect(screen.getByText('El email es requerido')).toBeInTheDocument();
            });
        });
    });

    describe('Accesibilidad', () => {
        it('debería tener labels apropiados para todos los campos', async () => {
            // Act
            render(<FormularioCheckout {...propsDefault} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
                expect(screen.getByLabelText('Ciudad')).toBeInTheDocument();
                expect(screen.getByLabelText('Código Postal')).toBeInTheDocument();
                expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
                expect(screen.getByLabelText('Efectivo')).toBeInTheDocument();
                expect(screen.getByLabelText('Tarjeta de Crédito')).toBeInTheDocument();
            });
        });

        it('debería ser navegable por teclado', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
            });

            // Act - Navegar con Tab
            await user.tab();
            expect(screen.getByLabelText('Dirección')).toHaveFocus();

            await user.tab();
            expect(screen.getByLabelText('Ciudad')).toHaveFocus();

            await user.tab();
            expect(screen.getByLabelText('Código Postal')).toHaveFocus();
        });

        it('debería anunciar errores a lectores de pantalla', async () => {
            // Arrange
            render(<FormularioCheckout {...propsDefault} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Procesar Pedido' })).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: 'Procesar Pedido' }));

            // Assert
            await waitFor(() => {
                const errorMessage = screen.getByText('La dirección es requerida');
                expect(errorMessage).toHaveAttribute('role', 'alert');
            });
        });
    });
});
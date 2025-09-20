import React from 'react';

/**
 * Componente básico de formulario de checkout para tests
 */
interface FormularioCheckoutProps {
    carritoId: string;
    clienteId?: string;
    onCheckoutCompleto: (resultado: any) => void;
    onError: (error: any) => void;
}

export function FormularioCheckout(props: FormularioCheckoutProps) {
    return (
        <div>
            <h1>Finalizar Compra</h1>
            <div>
                <h2>Datos de Entrega</h2>
                <label htmlFor="direccion">Dirección</label>
                <input id="direccion" name="direccion" type="text" />

                <label htmlFor="ciudad">Ciudad</label>
                <input id="ciudad" name="ciudad" type="text" />

                <label htmlFor="codigoPostal">Código Postal</label>
                <input id="codigoPostal" name="codigoPostal" type="text" />

                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" name="telefono" type="text" />

                <label htmlFor="instrucciones">Instrucciones de entrega</label>
                <textarea id="instrucciones" name="instrucciones" />
            </div>

            <div>
                <h2>Método de Pago</h2>
                <label>
                    <input type="radio" name="metodoPago" value="efectivo" />
                    Efectivo
                </label>
                <label>
                    <input type="radio" name="metodoPago" value="tarjeta_credito" />
                    Tarjeta de Crédito
                </label>
            </div>

            <div>
                <h2>Resumen del Pedido</h2>
                <div>Croissants de Mantequilla</div>
                <div>Pan Integral</div>
                <div>$5.500</div>
                <div>$440</div>
                <div>$5.940</div>
            </div>

            <button type="submit">Procesar Pedido</button>
        </div>
    );
}
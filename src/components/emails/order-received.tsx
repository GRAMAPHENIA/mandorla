import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface OrderReceivedEmailProps {
  order: {
    orderId: string;
    customer: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    date: string;
  };
}

export const OrderReceivedEmail: React.FC<
  Readonly<OrderReceivedEmailProps>
> = ({ order }) => (
  <Html>
    <Head />
    <Preview>Nuevo pedido recibido - Bakery Mandorla</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading as="h1" style={heading}>
            🍪 Nuevo Pedido Recibido
          </Heading>
          <Text style={orderNumber}>Pedido #{order.orderId}</Text>
        </Section>

        <Section style={section}>
          <Heading as="h2" style={h2}>
            Detalles del Cliente
          </Heading>
          <Text style={text}>
            <strong>Nombre:</strong> {order.customer.name}
          </Text>
          <Text style={text}>
            <strong>Email:</strong> {order.customer.email}
          </Text>
          <Text style={text}>
            <strong>Teléfono:</strong> {order.customer.phone}
          </Text>
          <Text style={{ ...text, marginBottom: "20px" }}>
            <strong>Dirección:</strong> {order.customer.address}
          </Text>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            Resumen del Pedido
          </Heading>

          {order.items.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={itemName}>{item.name}</Column>
              <Column style={itemQuantity}>{item.quantity} x</Column>
              <Column style={itemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Column>
            </Row>
          ))}

          <Hr style={hr} />

          <Row style={totalRow}>
            <Column>
              <Text style={totalText}>Total:</Text>
            </Column>
            <Column>
              <Text style={totalAmount}>${order.total.toFixed(2)}</Text>
            </Column>
          </Row>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Fecha del pedido: {new Date(order.date).toLocaleString("es-AR")}
          </Text>
          <Text style={footerNote}>
            Este es un correo automático, por favor no responder directamente.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Estilos
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const header = {
  padding: "20px 24px",
  backgroundColor: "#D6BD98",
  color: "#ffffff",
  textAlign: "center" as const,
  borderRadius: "8px 8px 0 0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const orderNumber = {
  fontSize: "16px",
  margin: "8px 0 0",
  opacity: 0.9,
};

const section = {
  padding: "24px",
};

const h2 = {
  fontSize: "18px",
  fontWeight: "bold",
  margin: "20px 0 10px",
  color: "#1a1a1a",
};

const text = {
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "4px 0",
  color: "#333333",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "10px 0",
};

const itemName = {
  flex: 2,
  fontSize: "14px",
};

const itemQuantity = {
  flex: 1,
  textAlign: "right" as const,
  fontSize: "14px",
  paddingRight: "10px",
};

const itemPrice = {
  flex: 1,
  textAlign: "right" as const,
  fontSize: "14px",
  fontWeight: "bold",
};

const totalRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "20px 0 0",
  paddingTop: "10px",
  borderTop: "1px solid #e6ebf1",
};

const totalText = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: 0,
};

const totalAmount = {
  fontSize: "16px",
  fontWeight: "bold",
  margin: 0,
  color: "#D6BD98",
};

const footer = {
  padding: "0 24px",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#8898aa",
  margin: "4px 0",
};

const footerNote = {
  fontSize: "12px",
  color: "#8898aa",
  margin: "4px 0",
  fontStyle: "italic",
};

import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderEmail = async (orderData: any) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Bakery Mandorla <onboarding@resend.dev>",
      to: ["bakerymandorla@gmail.com"],
      replyTo: "no-reply@resend.dev",
      subject: `Nuevo pedido #${orderData.orderId}`,
      react: OrderReceivedEmail({ order: orderData }),
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
};
function OrderReceivedEmail(arg0: { order: any; }): import("react").ReactNode {
  throw new Error("Function not implemented.");
}


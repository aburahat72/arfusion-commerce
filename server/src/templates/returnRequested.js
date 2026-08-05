const returnRequested = (name, orderId, requestType) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; overflow:hidden;">
    <div style="background:#2563eb; color:#fff; padding:20px; text-align:center;">
      <h2>ARFusion Commerce</h2>
    </div>

    <div style="padding:30px;">
      <h3>Hello ${name},</h3>

      <p>Your <strong>${requestType}</strong> request has been received successfully.</p>

      <p><strong>Order ID:</strong> ${orderId}</p>

      <p>Our support team will review your request and update you shortly.</p>

      <p>Thank you for shopping with ARFusion Commerce.</p>
    </div>

    <div style="background:#f5f5f5; padding:15px; text-align:center;">
      © ${new Date().getFullYear()} ARFusion Commerce
    </div>
  </div>
  `;
};

export default returnRequested;

const returnRejected = (name, orderId) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; overflow:hidden;">
    <div style="background:#dc2626; color:#fff; padding:20px; text-align:center;">
      <h2>Return Rejected</h2>
    </div>

    <div style="padding:30px;">
      <h3>Hello ${name},</h3>

      <p>Unfortunately, your return request has been rejected.</p>

      <p><strong>Order ID:</strong> ${orderId}</p>

      <p>If you have any questions, please contact our support team.</p>
    </div>

    <div style="background:#f5f5f5; padding:15px; text-align:center;">
      © ${new Date().getFullYear()} ARFusion Commerce
    </div>
  </div>
  `;
};

export default returnRejected;

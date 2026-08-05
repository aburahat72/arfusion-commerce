const replacementShipped = (name, orderId) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #e5e5e5; border-radius:8px; overflow:hidden;">
    <div style="background:#7c3aed; color:#fff; padding:20px; text-align:center;">
      <h2>Replacement Shipped</h2>
    </div>

    <div style="padding:30px;">
      <h3>Hello ${name},</h3>

      <p>Your replacement product has been shipped.</p>

      <p><strong>Order ID:</strong> ${orderId}</p>

      <p>You will receive your replacement item soon.</p>

      <p>Thank you for shopping with ARFusion Commerce.</p>
    </div>

    <div style="background:#f5f5f5; padding:15px; text-align:center;">
      © ${new Date().getFullYear()} ARFusion Commerce
    </div>
  </div>
  `;
};

export default replacementShipped;

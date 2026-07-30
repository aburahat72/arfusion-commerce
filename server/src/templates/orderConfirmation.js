const orderConfirmation = (name, orderId, amount) => `
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    background:#f4f6f9;
    font-family:Arial, Helvetica, sans-serif;
    padding:30px;
}

.container{
    max-width:650px;
    margin:auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 5px 20px rgba(0,0,0,.08);
}

.header{
    background:#2563eb;
    color:#ffffff;
    text-align:center;
    padding:30px;
}

.content{
    padding:35px;
    color:#374151;
    line-height:1.8;
}

.card{
    background:#f9fafb;
    border:1px solid #e5e7eb;
    border-radius:10px;
    padding:20px;
    margin:25px 0;
}

.card p{
    margin:8px 0;
}

.btn{
    display:inline-block;
    padding:14px 28px;
    background:#2563eb;
    color:#ffffff !important;
    text-decoration:none;
    border-radius:8px;
    margin-top:20px;
    font-weight:bold;
}

.footer{
    background:#f9fafb;
    text-align:center;
    color:#6b7280;
    font-size:14px;
    padding:25px;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h1>🎉 Order Confirmed</h1>

<p>Thank you for shopping with ARFusion Commerce</p>

</div>

<div class="content">

<h2>Hello ${name},</h2>

<p>

We have successfully received your order.

</p>

<p>

Our team is preparing your order for shipment.

</p>

<div class="card">

<p><strong>Order ID:</strong> ${orderId}</p>

<p><strong>Total Amount:</strong> ₹${amount}</p>

<p><strong>Status:</strong> Pending</p>

</div>

<a
class="btn"
href="${process.env.CLIENT_URL}/orders"
>

View My Orders

</a>

</div>

<div class="footer">

<p>

Need help?

Contact our support team anytime.

</p>

<br>

<p>

© 2026 ARFusion Commerce

</p>

</div>

</div>

</body>

</html>
`;

export default orderConfirmation;

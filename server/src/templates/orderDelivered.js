const orderDelivered = (name, orderId) => `
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
font-family:Arial,Helvetica,sans-serif;
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
background:#10b981;
color:#ffffff;
padding:30px;
text-align:center;
}

.content{
padding:35px;
color:#374151;
line-height:1.8;
}

.card{
background:#f9fafb;
border:1px solid #e5e7eb;
padding:20px;
border-radius:10px;
margin:25px 0;
}

.card p{
margin:10px 0;
}

.btn{
display:inline-block;
padding:14px 28px;
background:#10b981;
color:#ffffff !important;
text-decoration:none;
border-radius:8px;
margin-top:20px;
font-weight:bold;
}

.footer{
background:#f9fafb;
text-align:center;
padding:25px;
font-size:14px;
color:#6b7280;
}

</style>

</head>

<body>

<div class="container">

<div class="header">

<h1>📦 Order Delivered</h1>

<p>Your order has been delivered successfully.</p>

</div>

<div class="content">

<h2>Hello ${name},</h2>

<p>

Great news! Your order has been delivered successfully.

</p>

<p>

We hope you enjoy your purchase. Thank you for choosing ARFusion Commerce.

</p>

<div class="card">

<p><strong>Order ID:</strong> ${orderId}</p>

<p><strong>Status:</strong> Delivered</p>

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

Thank you for shopping with ARFusion Commerce.

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

export default orderDelivered;

const welcomeEmail = (name) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body{
      font-family:Arial,sans-serif;
      background:#f4f4f4;
      padding:20px;
    }

    .container{
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:10px;
      overflow:hidden;
    }

    .header{
      background:#2563eb;
      color:#ffffff;
      padding:20px;
      text-align:center;
    }

    .content{
      padding:30px;
      color:#333;
    }

    .footer{
      text-align:center;
      padding:20px;
      color:#777;
      font-size:14px;
      background:#fafafa;
    }

    .btn{
      display:inline-block;
      margin-top:20px;
      background:#2563eb;
      color:#ffffff;
      padding:12px 24px;
      text-decoration:none;
      border-radius:6px;
    }
  </style>
</head>

<body>

<div class="container">

<div class="header">
<h1>Welcome to ARFusion Commerce</h1>
</div>

<div class="content">

<h2>Hello ${name} 👋</h2>

<p>
Thank you for joining ARFusion Commerce.
</p>

<p>
We're excited to have you with us.
</p>

<a href="http://localhost:5173" class="btn">
Start Shopping
</a>

</div>

<div class="footer">

© 2026 ARFusion Commerce

</div>

</div>

</body>

</html>
`;

export default welcomeEmail;

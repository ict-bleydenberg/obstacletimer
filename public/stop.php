<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Obstacle Run Timer - FINISH</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container">
    <div class="sidebar-left">
        <h2>🏆 10 Nieuwste Tijden</h2>
        <div id="last10" class="times-list"></div>
    </div>
    
    <div class="main-area">
        <h1 class="main-title">FINISH</h1>
        <div id="timers" class="timers-grid"></div>
    </div>
    
    <div class="sidebar-right">
        <h2>⭐ TOP 10</h2>
        <div id="top10" class="times-list"></div>
    </div>
</div>
<script src="/socket.io/socket.io.js"></script>
<script src="client.js"></script>
<script>init(true)</script>
</body>
</html>

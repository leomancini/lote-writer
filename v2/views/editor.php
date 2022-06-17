<!DOCTYPE HTML>
<html>
	<head>
		<title>LOTE Writer</title>
		<meta charset='utf8'>
		<meta name='viewport' content='width=device-width, initial-scale=1'>
		<link rel='preconnect' href='https://fonts.gstatic.com'>
		<link rel='stylesheet'href='https://fonts.googleapis.com/css2?family=Inter'>
		<link rel='stylesheet/less' href='../resources/css/editor.less'>
		<script type='text/javascript'>
			window.pageId = '<?php echo $_GET['page']; ?>';
		</script>
	</head>
	<body>
		<a href='../'>
			<div id='backToIndex'>
				<div class='icon'></div>
			</div>
		</a>
		<div id='toolbar'>
			<div id='leftMenuItems'></div>
			<div id='modeSelectorContainer'>
				<div id='modeSelectorSelectedBackground'></div>
				<div class='modeSelector selected'>Write</div>
				<div class='modeSelector'>Review</div>
				<div class='modeSelector'>Study</div>
			</div>
			<div id='rightMenuItems'></div>
		</div>
		<div id='pages'>
			<div id='editor'></div>
			<div style='display: none' id='content'></div>
		</div>
		<script src='../resources/js/base.js'></script>
		<script src='../resources/js/lib/prosemirror.js'></script>
		<script src='../resources/js/lib/less.js'></script>
		<script src='../resources/js/lib/require-pm.js'></script>
		<script src='../resources/js/toolbar.js'></script>
		<script src='../resources/js/editor.js'></script>
	</body>
</html>
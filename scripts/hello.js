"use strict";
var body = document.body;
var canvas = document.getElementById("canvas");
var canvasHolder = document.getElementById("canvas-holder");
canvas.onclick = function(e) {
	
	var div = document.createElement('div');
	div.className = "table-container";
	div.style.width = 100;
	div.style.height = 60;
	var header = document.createElement('p');
	header.innerHTML = "Table 1";
	header.style.align = "center";
	header.style.font_weight = "bold";
	header.style.width = 100 + "%";
	div.appendChild(header);

	var table = document.createElement('table');
	table.style.width = 100;
	var initRow = table.insertRow(0);
	initRow.insertCell(0).innerHTML = "Cell 1";
	initRow.insertCell(1).innerHTML = "Cell 2";
	div.appendChild(table);

	var obj = getOnCanvasClickCoords(e.clientX, e.clientY);

	div.style.left = obj.x + "px";
	div.style.top = obj.y + "px";
	canvas.appendChild(div);
}

function getOnCanvasClickCoords(clientX, clientY) {
	var cHPos = canvasHolder.getBoundingClientRect();
	var canvasCSS = window.getComputedStyle(canvas);
	//var canvasHolderCSS = window.getComputedStyle(canvasHolder);

	var canvasCoords = {};
	canvasCoords.x = clientX - cHPos.x - 
		parseInt(canvasCSS.marginLeft) + canvasHolder.scrollLeft;

	canvasCoords.y = clientY - cHPos.y - 
		parseInt(canvasCSS.marginTop) + canvasHolder.scrollTop;

	return canvasCoords;
}
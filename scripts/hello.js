"use strict";
var body = document.body;
var canvas = document.getElementById("canvas");
canvas.onclick = function(e) {
	
	//TODO: add drag-n-drop

	var table = document.createElement('table');
	table.className = "table-container";
	table.createTHead();
	table.tHead.innerHTML = "Table 1";
	
	var initRow = table.insertRow(0);
	initRow.insertCell(0).innerHTML = "Cell 1";
	initRow.insertCell(1).innerHTML = "Cell 2";

	var obj = getOnCanvasClickCoords(e.clientX, e.clientY);

	table.style.left = obj.x + "px";
	table.style.top = obj.y + "px";

	canvas.appendChild(table);

	var canvasCSS = window.getComputedStyle(canvas);
	var Zayka = window.getComputedStyle(table);

	if (obj.x + parseInt(Zayka.width) > parseInt(canvasCSS.width)) {
		table.style.left = parseInt(canvasCSS.width) - parseInt(Zayka.width) - 
			parseInt(Zayka.borderRight) - 10 + "px";
	}
	if (obj.y + parseInt(Zayka.height) > parseInt(canvasCSS.height)) {
		table.style.top = parseInt(canvasCSS.height) - parseInt(Zayka.height) -
			parseInt(Zayka.borderBottom) - 10 + "px";
	}
}

function getOnCanvasClickCoords(clientX, clientY) {
	var canvasHolder = document.getElementById("canvas-holder");
	var canvasHolderRect = canvasHolder.getBoundingClientRect();

	var canvasCoords = {};
	canvasCoords.x = clientX + canvasHolder.scrollLeft - canvasHolderRect.x;

	canvasCoords.y = clientY + canvasHolder.scrollTop - canvasHolderRect.y;

	return canvasCoords;
}
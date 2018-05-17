"use strict";
var body = document.body;
var canvas = document.getElementById("canvas");
canvas.onclick = function(e) {
	
	//TODO: add drag-n-drop

	var table = document.createElement('table');
	table.className = "table-container";
	var header = table.createTHead();
	table.tHead.insertRow(0).innerHTML = "<th colspan=\"8\">Table 1</th>";
	//table.tHead.innerHTML = "Table 1";
	
	var tBody = document.createElement('tbody');
	var initRow = tBody.insertRow(0);
	initRow.insertCell(0).innerHTML = "Cell 1";
	initRow.insertCell(1).innerHTML = "Cell 2";
	table.appendChild(tBody);

	var obj = getOnCanvasClickCoords(e.clientX, e.clientY);

	table.style.left = obj.x + "px";
	table.style.top = obj.y + "px";

	canvas.appendChild(table);

	var canvasCSS = window.getComputedStyle(canvas);
	var tableCS = window.getComputedStyle(table);

	if (obj.x + parseInt(tableCS.width) > parseInt(canvasCSS.width)) {
		table.style.left = parseInt(canvasCSS.width) - parseInt(tableCS.width) - 
			parseInt(tableCS.borderRight) - 10 + "px";
	}
	if (obj.y + parseInt(tableCS.height) > parseInt(canvasCSS.height)) {
		table.style.top = parseInt(canvasCSS.height) - parseInt(tableCS.height) -
			parseInt(tableCS.borderBottom) - 10 + "px";
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
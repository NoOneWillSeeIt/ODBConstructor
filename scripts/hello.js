"use strict";
var body = document.body;
var canvas = document.getElementById("canvas");
var canvasHolder = document.getElementById("canvas-holder");
canvas.onclick = function(e) {
	
	var div = document.createElement('div');
	div.className = "table-container";
	// div.style.width = 100 + "px";
	// div.style.height = 80 + "px";
	var header = document.createElement('p');
	header.innerHTML = "Table 1";
	// header.style.alignSelf = "center";
	// header.style.font_weight = "bold";
	// header.style.width = 100 + "%";
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

	console.log(obj);

	canvas.appendChild(div);

	var canvasCSS = window.getComputedStyle(canvas);
	var Zayka = window.getComputedStyle(div);
	alert("x = " + Zayka.width + " objx = " + obj.x + 
		"y = " + Zayka.height + " objy = " + obj.y);

	console.log(Zayka);

	alert("x = " + (obj.x + parseInt(Zayka.width) > parseInt(canvasCSS.width)) +
		" y = " + (obj.y + parseInt(Zayka.height) > parseInt(canvasCSS.height)));

	if (obj.x + parseInt(Zayka.width) > parseInt(canvasCSS.width)) {
		div.style.left = parseInt(canvasCSS.width) - parseInt(Zayka.width) - 
			parseInt(Zayka.borderRight) - 10 + "px";
	}
	if (obj.y + parseInt(Zayka.height) > parseInt(canvasCSS.height)) {
		div.style.top = parseInt(canvasCSS.height) - parseInt(Zayka.height) -
			parseInt(Zayka.borderBottom) - 10 + "px";
	}
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
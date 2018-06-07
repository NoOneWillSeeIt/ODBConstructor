"use strict";
var body = document.body;
var canvas = document.getElementById("canvas");
var tableList = [];

canvas.onclick = function(e) {

	var table = createTableDOM();

	var canvasBox = getCanvasBoxOffset();
	var clickCoords = {
		x: e.pageX + canvasBox.scrollLeft - canvasBox.x,
		y: e.pageY + canvasBox.scrollTop - canvasBox.y
	};
	table.style.left = clickCoords.x + "px";
	table.style.top = clickCoords.y + "px";

	canvas.appendChild(table);

	var canvasCSS = window.getComputedStyle(canvas);
	var tableCS = window.getComputedStyle(table);

	if (clickCoords.x + parseInt(tableCS.width) > parseInt(canvasCSS.width)) {
		table.style.left = parseInt(canvasCSS.width) - parseInt(tableCS.width) - 
			parseInt(tableCS.borderRight) - 10 + "px";
	}
	if (clickCoords.y + parseInt(tableCS.height) > parseInt(canvasCSS.height)) {
		table.style.top = parseInt(canvasCSS.height) - parseInt(tableCS.height) -
			parseInt(tableCS.borderBottom) - 10 + "px";
	}

	makeDraggableTable(table);

	tableList.push(table);
}

var newTableBtn = document.getElementById("new-table-btn");
newTableBtn.onclick = function(e) {
	var table = createTableDOM();

	var canvasBox = getCanvasBoxOffset();
	
	table.style.left = canvasBox.scrollLeft + 10 + "px";
	table.style.top = canvasBox.scrollTop + 10 + "px";

	canvas.appendChild(table);

	makeDraggableTable(table);
	tableList.push(table);	
}

function getCanvasClickCoords(e) {
	var canvasBox = document.getElementById("canvas-box");
	var canvasBoxRect = canvasBox.getBoundingClientRect();
	return {
		left: e.pageX + canvasBox.scrollLeft - canvasBoxRect.x,
		top: e.pageY + canvasBox.scrollTop - canvasBoxRect.y
	};
}

function getCanvasBoxOffset() {
	var canvasBox = document.getElementById("canvas-box");
	var canvasBoxRect = canvasBox.getBoundingClientRect();
	return {
		scrollLeft: canvasBox.scrollLeft,
		scrollTop: canvasBox.scrollTop,
		x: canvasBoxRect.x,
		y: canvasBoxRect.y
	};
}

function makeDraggableTable(elem) {
	elem.firstChild.onmousedown = mouseDown;
	var shiftX = 0, shiftY = 0;
	var canvasBox = {};
	function mouseDown(e) {
		var clickCoords = getCanvasClickCoords(e);
		shiftX = elem.offsetLeft - clickCoords.left;
		shiftY = elem.offsetTop - clickCoords.top;
		canvasBox = getCanvasBoxOffset();
		document.onmousemove = mouseDrag;
		document.onmouseup = stopDrag;
	}
	function mouseDrag(e) {
		canvasBox = getCanvasBoxOffset();
		elem.style.left = e.pageX - canvasBox.x + canvasBox.scrollLeft + shiftX + "px";
		elem.style.top = e.pageY - canvasBox.y + canvasBox.scrollTop + shiftY + "px";
	}
	function stopDrag(e) {
		document.onmousemove = null;
		document.onmouseup = null;
	}
}

function createTableDOM() {
	var table = document.createElement('table');
	table.className = "table-container";
	var header = table.createTHead();
	table.tHead.insertRow(0).innerHTML = "<th colspan=\"8\">Table "+(tableList.length+1)+"</th>";

	var tBody = document.createElement('tbody');
	var initRow = tBody.insertRow(0);
	initRow.insertCell(0).innerHTML = "Cell 1";
	initRow.insertCell(1).innerHTML = "Cell 2";
	table.appendChild(tBody);
	return table;
}

function getElemCoords(elem) {
	var box = elem.getBoundingClientRect();
	var container = elem.parentElement;
	return {
		left: box.x + container.scrollLeft,
		top: box.y + container.scrollTop
	};
}
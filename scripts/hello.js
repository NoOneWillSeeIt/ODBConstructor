'use strict';
let body = document.body;
let canvas = document.getElementById("canvas");
let contextMenu = document.getElementById("canvas-context");

function tableManager(table) {
	let self = this;
	this.table = table;
	this.tbody = table.tBodies[0];
	console.log(table, table.tBodies);
	this.appendRow = function (){
		console.log(table, table.tBodies);
		let row = self.tbody.insertRow(0);
		row.insertCell(0).innerHTML="asd";
		row.insertCell(1).innerHTML="asdasd";
	}
	this.deleteRow = function (){}
	this.editRow = function (){}
	this.moveRow = function (){}
}

let tableList=[];

contextMenu.onclick = function(e) {
	let action = e.target.getAttribute('data-action');
	let menuRect = contextMenu.getBoundingClientRect();
	let initCoords = {
		pageX: menuRect.left,
		pageY: menuRect.top
	}
	switch(action) {
		case "createTable": createTable(initCoords); break;
	}
	contextMenu.style.display = "none";
}

contextMenu.onmousedown = function(e) {
	e.stopPropagation();
}

canvas.oncontextmenu = function(e) {
	let canvasBox = getCanvasBoxOffset();
	let clickCoords = {
		x: e.pageX + canvasBox.scrollLeft - canvasBox.x,
		y: e.pageY + canvasBox.scrollTop - canvasBox.y
	};
	contextMenu.style.left = clickCoords.x + "px";
	contextMenu.style.top = clickCoords.y + "px";
	contextMenu.style.display = "block";

	let canvasCSS = window.getComputedStyle(canvas);
	let cMenuCS = window.getComputedStyle(contextMenu);

	if (clickCoords.x + parseInt(cMenuCS.width) > parseInt(canvasCSS.width)) {
		cMenu.style.left = parseInt(canvasCSS.width) - parseInt(cMenuCS.width) - 
			parseInt(cMenuCS.borderRight) - 10 + "px";
	}
	if (clickCoords.y + parseInt(cMenuCS.height) > parseInt(canvasCSS.height)) {
		cMenu.style.top = parseInt(canvasCSS.height) - parseInt(cMenuCS.height) -
			parseInt(cMenuCS.borderBottom) - 10 + "px";
	}
	return false;
}

document.onmousedown = function(e) {
	contextMenu.style.display="none";
}

let newTableBtn = document.getElementById("new-table-btn");
newTableBtn.onclick = createTable;

function getCanvasClickCoords(e) {
	let canvasBox = document.getElementById("canvas-box");
	let canvasBoxRect = canvasBox.getBoundingClientRect();
	return {
		left: e.pageX + canvasBox.scrollLeft - canvasBoxRect.x,
		top: e.pageY + canvasBox.scrollTop - canvasBoxRect.y
	};
}

function getCanvasBoxOffset() {
	let canvasBox = document.getElementById("canvas-box");
	let canvasBoxRect = canvasBox.getBoundingClientRect();
	return {
		scrollLeft: canvasBox.scrollLeft,
		scrollTop: canvasBox.scrollTop,
		x: canvasBoxRect.x,
		y: canvasBoxRect.y
	};
}

function makeDraggableTable(elem) {
	elem.firstChild.onmousedown = mouseDown;
	let shiftX = 0, shiftY = 0;
	let canvasBox = {};
	function mouseDown(e) {
		let clickCoords = getCanvasClickCoords(e);
		shiftX = elem.offsetLeft - clickCoords.left;
		shiftY = elem.offsetTop - clickCoords.top;
		canvasBox = getCanvasBoxOffset();
		document.onmousemove = mouseDrag;
		document.onmouseup = stopDrag;
		document.onselectstart = function() {return false;}
	}
	function mouseDrag(e) {
		canvasBox = getCanvasBoxOffset();
		elem.style.left = e.pageX - canvasBox.x + canvasBox.scrollLeft + shiftX + "px";
		elem.style.top = e.pageY - canvasBox.y + canvasBox.scrollTop + shiftY + "px";
	}
	function stopDrag(e) {
		document.onmousemove = null;
		document.onmouseup = null;
		document.onselectstart = null;
	}
}

function createTable(e) {
	let table = document.createElement('table');
	table.className = "table";
	let header = table.createTHead();
	table.tHead.insertRow(0).innerHTML = "<th colspan=\"8\" class=\"theader\">Table "+(tableList.length+1)+"</th>";

	let tFoot = document.createElement('tfoot');
	let th = document.createElement('th');
	th.colSpan=8;
	th.className="tfooter";
	var btn = document.createElement('button');
	btn.className="button";
	btn.innerHTML="Добавить...";
	th.appendChild(btn);
	tFoot.insertRow(0).appendChild(th);
	// tFoot.insertRow(0).innerHTML = "<th colspan=\"8\" class=\"tfooter\"><button class=\"button\">"+
	// "Добавить...</button></th>";
	table.appendChild(tFoot);

	let tBody = document.createElement('tbody');
	let initRow = tBody.insertRow(0);
	initRow.insertCell(0).innerHTML = "Cell 1";
	initRow.insertCell(1).innerHTML = "Cell 2";
	table.appendChild(tBody);

	let canvasBox = getCanvasBoxOffset();
	canvas.appendChild(table);
	if ((e.pageX < canvasBox.x) || (e.pageY<canvasBox.y)) {
		table.style.left = canvasBox.scrollLeft + 10 + "px";
		table.style.top = canvasBox.scrollTop + 10 + "px";
	}
	else {
		let clickCoords = {
			x: e.pageX + canvasBox.scrollLeft - canvasBox.x,
			y: e.pageY + canvasBox.scrollTop - canvasBox.y
		};
		table.style.left = clickCoords.x + "px";
		table.style.top = clickCoords.y + "px";
		let canvasCSS = window.getComputedStyle(canvas);
		let tableCS = window.getComputedStyle(table);

		if (clickCoords.x + parseInt(tableCS.width) > parseInt(canvasCSS.width)) {
			table.style.left = parseInt(canvasCSS.width) - parseInt(tableCS.width) - 
				parseInt(tableCS.borderRight) - 10 + "px";
		}
		if (clickCoords.y + parseInt(tableCS.height) > parseInt(canvasCSS.height)) {
			table.style.top = parseInt(canvasCSS.height) - parseInt(tableCS.height) -
				parseInt(tableCS.borderBottom) - 10 + "px";
		}

	}
	makeDraggableTable(table);
	let tableM = new tableManager(table);
	btn.onclick = tableM.appendRow;
	tableList.push(tableM);
}

function getElemCoords(elem) {
	let box = elem.getBoundingClientRect();
	let container = elem.parentElement;
	return {
		left: box.x + container.scrollLeft,
		top: box.y + container.scrollTop
	};
}

let accordions = document.getElementsByClassName("accordion");
[].forEach.call(accordions, function (elem) {
	elem.onclick = function(e) {
		this.classList.toggle("active");
		let panel = this.nextElementSibling;
		if(panel.style.maxHeight)
			panel.style.maxHeight = null;
		else
			panel.style.maxHeight = panel.scrollHeight + "px";
	}
});
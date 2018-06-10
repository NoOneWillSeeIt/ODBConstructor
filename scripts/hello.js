'use strict';
let body = document.body;
let canvas = document.getElementById("canvas");
let contextMenu = document.getElementById("canvas-context");

function tableManager(table, tname) {
	let name = tname;
	this.DOMtable = table;
	let tbody = this.DOMtable.tBodies[0];
	function field(options) {
		if (options.name == undefined || options.type == undefined) {
			alert("Неверные значения имени и типа поля");
			return null;
		}
		this.name = options.name;
		this.type = options.type;
		this.nullable = options.nullable || false;
		this.primK = options.primK || false;
		this.autoinc = options.autoinc || false;
		this.typeOpt1 = options.typeOpt1 || null;
		this.typeOpt2 = options.typeOpt2 || null;
		this.FK = options.FK || null;
		let self = this;
		this.editField = function(options) {
			self.name = options.name || self.name;
			self.type = options.type || self.type;
			self.nullable = options.nullable || self.nullable;
			self.primK = options.primK || self.primK;
			self.autoinc = options.autoinc || self.autoinc;
			self.typeOpt1 = options.typeOpt1 || self.typeOpt1;
			self.typeOpt2 = options.typeOpt2 || self.typeOpt2;
			self.FK = options.FK || self.FK;
		}
	}
	let fieldList = [];
	this.appendField = function(options) {
		let nfield = new field(options);
		if(nfield === null) {
			alert("Не удалось добавить поле");
			return;
		}
		console.log(self, this, fieldList);
		fieldList.push(nfield);
		let row = tbody.insertRow(-1);
		row.insertCell(0).innerHTML = (nfield.primK)? "+" : " ";
		row.insertCell(1).innerHTML = nfield.name;
		row.insertCell(2).innerHTML = nfield.type;
		row.insertCell(3).innerHTML = "  ";
	}
	this.deleteRow = function(num) {
		tbody.removeChild(tbody.rows(num));
		fieldList.splice(num, 1);
	}
	this.updateField = function(num, options) {
		fieldList[num].editField(options);
	}
	this.moveRow = function(numSrc, numDst) {
		let removed = fieldList.splice(numSrc, 1);
		let insNum = (numSrc < numDst)? numDst - 1: numDst;
		fieldList.splice(insNum, 0, removed);
		DOMtable.deleteRow(numSrc);
		if (tbody.rows.length < insNum + 1)
			tbody.appendChild(removed);
		else
			tbody.insertBefore(removed, tbody.children[insNum + 1]);
	}
	this.getFields = function() {
		return fieldList.slice();
	}
	this.getName = function() {
		return name;
	}
	this.setName = function(tname) {
		name = tname || name;
	}
	this.getConnections = function() {}
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
		elem.style.zIndex = 1000;
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
		elem.style.zIndex = 0;
	}
}

function makeSelectableTable(elem) {
	elem.onclick = function(e) {
		let side = document.getElementById("sidebar");
		let panels = side.getElementsByClassName("panel");
		let index = null;
		for (let i = 0; i < tableList.length; i++) {
			if(tableList[i].DOMtable === elem){
				index=i;
				break;
			}
		}
		if (index==null) {
			console.log(elem, tableList, "Таблица не найдена");
			return false;
		}
		for (let i = 0; i < panels.length; i++) {
			switch(panels[i].getAttribute("data-content")) {
				case "table":
					let text = document.createTextNode(tableList[index].getName());
					panels[i].appendChild(text);
					break;
				case "fields":
					let fields = tableList[index].getFields();
					let table = document.createElement("table");
					for (let j = 0; j < fields.length; j++) {
						table.insertRow.innerHTML=fields[j];
					}
					break;
				case "connectrions":
					break;
			}
		}
	} 
}

function createTable(e) {
	let table = document.createElement('table');
	table.className = "table";
	let header = table.createTHead();
	table.tHead.insertRow(0).innerHTML = "<th colspan=\"8\" class=\"theader\">Table "+(tableList.length+1)+"</th>";

	// let tFoot = document.createElement('tfoot');
	// let th = document.createElement('th');
	// th.colSpan=8;
	// th.className="tfooter";
	// let btn = document.createElement('button');
	// btn.className="button";
	// btn.innerHTML="Добавить...";
	// th.appendChild(btn);
	// tFoot.insertRow(0).appendChild(th);
	// table.appendChild(tFoot);

	let tbody = document.createElement('tbody');
	table.appendChild(tbody);

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
	makeSelectableTable(table);
	let tableM = new tableManager(table, "Table" + (tableList.length+1));
	tableM.appendField({
		name: "lalal",
		type: "int"
	})
	// btn.onclick = tableM.appendRow;
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
﻿'use strict';
let body = document.body;
let canvas = document.getElementById("canvas");
let contextMenu = document.getElementById("canvas-context");

function tableManager(table) {
	let name = "";
	let DOMtable = table;
	let tbody = DOMtable.tBodies[0];

	function field(options) {
		this.name = options.name;
		this.type = options.type;
		this.nullable = options.nullable || false;
		this.primK = options.primK || false;
		this.autoinc = options.autoinc || false;
		this.typeOpt1 = options.typeOpt1 || null;
		this.typeOpt2 = options.typeOpt2 || null;
		this.FK = options.FK || null;
		this.idInitVal = options.idInitVal || null;
		this.idStep = options.idStep || null;

		this.editField = function(options) {
			this.name = options.name || this.name;
			this.type = options.type || this.type;
			this.nullable = options.nullable || this.nullable;
			this.primK = options.primK || this.primK;
			this.autoinc = options.autoinc || this.autoinc;
			this.FK = options.FK || this.FK;
			this.idInitVal = options.idInitVal || this.idInitVal;
			this.idStep = options.idStep || this.idStep;
		}
	}

	let fieldList = [];
	this.updateHTML = function() {
		tbody.parentElement.replaceChild(document.createElement("tbody"), tbody);
		tbody = DOMtable.tBodies[0];
		for (let i = 0; i < fieldList.length; i++) {
			let row = tbody.insertRow(-1);
			row.insertCell(0).innerHTML = (fieldList[i].primK)? "+" : " ";
			row.insertCell(1).innerHTML = fieldList[i].name;
			row.insertCell(2).innerHTML = fieldList[i].type;
			row.insertCell(3).innerHTML = "  ";
		}
	}
	this.setFields = function(fields) {
		fieldList = fields.slice();
		this.updateHTML();
	}
	this.getHTMLTable = function(e) {
		return DOMtable;
	}

	this.appendField = function(options) {
		let nfield = new field(options);
		if(nfield === null) {
			alert("Не удалось добавить поле");
			return;
		}
		fieldList.push(nfield);
		let row = tbody.insertRow(-1);
		row.insertCell(0).innerHTML = (nfield.primK)? "+" : " ";
		row.insertCell(1).innerHTML = nfield.name;
		row.insertCell(2).innerHTML = nfield.type;
		row.insertCell(3).innerHTML = "  ";
	}
	this.deleteField = function(num) {
		tbody.removeChild(tbody.rows[num]);
		fieldList.splice(num, 1);
	}
	this.updateField = function(num, options) {
		console.log(num, options, fieldList[num]);
		fieldList[num].editField(options);
		this.updateHTML();
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
		DOMtable.tHead.rows[0].cells[0].textContent = name;
	}
	this.getConnections = function() {}

	let self = this;
	new function makeDraggable(DOMtable) {
		table.tHead.onmousedown = mouseDown;
		let shiftX = 0, shiftY = 0;
		let canvasBox = {};
		function mouseDown(e) {
			table.style.zIndex = 1000;
			let clickCoords = getCanvasClickCoords(e);
			shiftX = table.offsetLeft - clickCoords.left;
			shiftY = table.offsetTop - clickCoords.top;
			canvasBox = getCanvasBoxOffset();
			setSidebar(self);
			document.onmousemove = mouseDrag;
			document.onmouseup = stopDrag;
			document.onselectstart = function() {return false;}
		}
		function mouseDrag(e) {
			canvasBox = getCanvasBoxOffset();
			table.style.left = e.pageX - canvasBox.x + canvasBox.scrollLeft + shiftX + "px";
			table.style.top = e.pageY - canvasBox.y + canvasBox.scrollTop + shiftY + "px";
		}
		function stopDrag(e) {
			document.onmousemove = null;
			document.onmouseup = null;
			document.onselectstart = null;
			table.style.zIndex = 0;
		}
	}
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


function setSidebar(tableM) {
	let tpanel = document.getElementById("table-panel");
	let fpanel = document.getElementById("fields-panel");
	let cpanel = document.getElementById("connections-panel");
	let fieldsTable = document.getElementById("fieldsTable");
	let textarea = document.getElementById("tableName");
	textarea.value = tableM.getName();
	textarea.addEventListener("focusout", function(e) {
		if (textarea.value != "")
			tableM.setName(textarea.value);
		else
			textarea.value = tableM.getName();
	});
	function clearNewLine(e) {
		let str = e.target.value.replace(/\r|\n|\t|\v/g, "");
		e.target.value = str;
	}
	textarea.addEventListener("keyup", clearNewLine, false);

	let fields = tableM.getFields();
	for (let i = 0; i < fields.length; i++) {
		let field = fields[i];
		let initElems = fieldsTable.tBodies[0].getElementsByClassName("initial");
		let row;
		for (let j = 0; j < initElems.length; j++) {
			if(initElems[j].getAttribute("data-content") == "field-param"){
				row = initElems[j].cloneNode(true);
				break;
			}
		}
		fieldBinder(row, field, i);
		fieldsTable.tBodies[0].appendChild(row);
	}

	function fieldBinder(HTMLrow, field, index) {
		HTMLrow.classList.remove("initial");

		let checkBoxOnChange = function(e) {
			console.log(this, this.name);
			field[this.name] = this.checked? true: false;
			let options = {
				[this.name]: this.checked? true: false
			};
			tableM.updateField(index, options);
		}

		let dragbtn = HTMLrow.cells[0].firstChild;
		dragbtn.textContent = '\u21C5';

		let input = HTMLrow.cells[1].firstChild;
		input.value = field.name;
		input.addEventListener("keyup", clearNewLine, true);
		input.addEventListener("focusout", function(e) {
			if (input.value != "") {
				field.name = input.value;
				tableM.updateField(index, { name: field.name});
			}
			else
				input.value = field.name;
		});

		let typecell = HTMLrow.cells[2].firstChild;
		let typeTextArea = typecell.firstChild;
		let typeBtn = typecell.lastChild;
		typeTextArea.value = field.type;
		typeTextArea.addEventListener("keyup", clearNewLine, true);
		typeTextArea.addEventListener("focusout", function(e) {
			if(this.value != "") {
				field.type = this.value;
				tableM.updateField(index, { type: field.type});
			}
			else
				this.value = field.type;
		});
		typeBtn.onclick = function(e) {
			let chooseBox = document.getElementById("typeChooseBox");
			chooseBox.classList.remove("hidden")
			chooseBox.style.left = chooseBox.parentElement.offsetWidth
			- chooseBox.offsetWidth + "px";
			chooseBox.style.top = e.pageY - chooseBox.offsetHeight/2 - 10 + "px";
			if (parseInt(chooseBox.style.top)<30)
				chooseBox.style.top = "30px";
			chooseBox.onmousedown = function(e) {e.stopPropagation();}
			chooseBox.getElementsByTagName("button")[0].onclick = function(e) {
				let collection = chooseBox.getElementsByTagName("input");
				for (let i = 0; i < collection.length; i++) {
					if(collection[i].checked) {
						typeTextArea.value = collection[i].value;
						field.type = typeTextArea.value;
						tableM.updateField(index, { type: typeTextArea.value});
						collection[i].checked = false;
						break;
					}
				}
				chooseBox.classList.add("hidden");
			}			
		}

		let primChBox = HTMLrow.cells[3].firstChild;
		primChBox.checked = (field.primK)? true: false;
		primChBox.addEventListener("change", checkBoxOnChange, true);

		let nullChBox = HTMLrow.cells[4].firstChild;
		nullChBox.checked = (field.nullable)? true: false;
		nullChBox.addEventListener("change", checkBoxOnChange, true);

		let detbtn = HTMLrow.cells[5].firstChild;
		detbtn.onclick = function(e) {
			if(HTMLrow.nextElementSibling && HTMLrow.nextElementSibling.hasAttribute("data-content")) {
				HTMLrow.parentElement.removeChild(HTMLrow.nextElementSibling);
				return;
			}
			console.log(HTMLrow, HTMLrow.nextElementSibling);
			let initElem = fieldsTable.tBodies[0].getElementsByClassName("initial");
			let row;
			for (let i = 0; i < initElem.length; i++) {
				if (initElem[i].getAttribute("data-content")=="field-det"){
					row = initElem[i].cloneNode(true);
					break;
				}
			}

			row.classList.remove("initial");
			let cell = row.cells[0];
			let inputElem = cell.getElementsByTagName("input");
			let autoincCheck;
			for (let i = 0; i < inputElem.length; i++) {
				inputElem[i].checked = field[inputElem[i].name] ? true: false;
				inputElem[i].addEventListener("change", checkBoxOnChange, true);
				if(inputElem[i].getAttribute("name")=="autoinc")
					autoincCheck=inputElem[i];
			}
			let cellText = cell.getElementsByTagName("textarea");
			for (let i = 0; i < cellText.length; i++) {
				cellText[i].addEventListener("keyup", clearNewLine, true);
				cellText[i].addEventListener("focusout", function(e) {
					field[this.name] = this.value;
					tableM.updateField(index, {[this.name]: this.value});
				});
			}
			autoincCheck.addEventListener("change", function(e) {
				if(this.checked) {
					cellText[0].classList.remove("disabled");
					cellText[1].classList.remove("disabled");
				}
				else {
					cellText[0].classList.add("disabled");
					cellText[1].classList.add("disabled");
				}
			});
			fieldsTable.tBodies[0].insertBefore(row, HTMLrow.nextSibling);
			resizeAccordion(fpanel);
		}

		let delbtn = HTMLrow.cells[6].firstChild;
		delbtn.onclick = function(e) {
			let index = fields.indexOf(field);
			if(index > -1) {
				fields.splice(index, 1);
			}
			fieldsTable.tBodies[0].removeChild(HTMLrow);
			console.log(tableM.getFields(), fields);
			tableM.deleteField(index);
			resizeAccordion(fpanel);
		}
	}

	function resizeAccordion(elem) {
		elem.style.maxHeight = "0px";
		elem.style.maxHeight = elem.scrollHeight + "px";
	}

	let newFieldBtn = document.getElementById("addFieldBtn");
	newFieldBtn.onclick = function(e) {
		let options = {
			name: "поле" + fields.length,
			type: "int",
			nullable: false,
			primK: false,
			autoinc: false,
			typeOpt1: null,
			typeOpt2: null,
			FK: null
		};
		fields.push(options);
		let row = fieldsTable.tBodies[0].getElementsByClassName("initial")[0].cloneNode(true);
		fieldBinder(row, fields[fields.length-1], fields.length-1);
		row.classList.remove("initial");
		fieldsTable.tBodies[0].appendChild(row);
		tableM.appendField(options);
		resizeAccordion(fpanel);
		console.log(tableM.getFields(), fields);
	}
}

function unsetSidebar() { //<------------------------------ доделать
	let tpanel = document.getElementById("table-panel");
	tpanel.classList.add("hidden");
	let fpanel = document.getElementById("fields-panel");
	fpanel.classList.add("hidden");
	let cpanel = document.getElementById("connections-panel");
	cpanel.classList.add("hidden");	
}

function createTable(e) {
	let initTable = canvas.getElementsByClassName("table initial")[0];
	let table = initTable.cloneNode(true);
	table.classList.remove("initial");
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
	let tableM = new tableManager(table);
	tableM.appendField({
		name: "lalal",
		type: "int"
	});
	tableM.setName("Таблица" + tableList.length);
	setSidebar(tableM);
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
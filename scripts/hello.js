'use strict';
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
		this.FK = options.FK || null;
		this.idInitVal = options.idInitVal || null;
		this.idStep = options.idStep || null;
		this.size = options.size || null;
		this.precision = options.precision || null;
		let funclist = [];

		this.editField = function(options) {
			this.name = options.name || this.name;
			this.type = options.type || this.type;
			this.nullable = (options.nullable!=null)? options.nullable: this.nullable;
			this.primK = (options.primK!=null)? options.primK: this.primK;
			this.autoinc = (options.autoinc!=null)? options.autoinc: this.autoinc;
			this.FK = options.FK || this.FK;
			this.idInitVal = options.idInitVal || this.idInitVal;
			this.idStep = options.idStep || this.idStep;
			this.size = options.size || this.size;
			this.precision = options.precision || this.precision;
			this.notify(options);
		}
		this.notify = function(options) {
			for (var i = 0; i < funclist.length; i++) {
				funclist[i](options);
			}
		}
		this.subscribe = function(func) {
			funclist.push(func);
		}
		this.unsubAll = function() {
			funclist=[];
		}
	}

	let fieldList = [];
	this.updateHTML = function() {
		DOMtable.tHead.rows[0].cells[0].textContent = name;
		tbody.parentElement.replaceChild(document.createElement("tbody"), tbody);
		tbody = DOMtable.tBodies[0];
		for (let i = 0; i < fieldList.length; i++) {
			let row = tbody.insertRow(-1);
			row.classList.add("table-row");
			row.insertCell(0).innerHTML = (fieldList[i].primK)? "+" : " ";
			row.insertCell(1).innerHTML = fieldList[i].name;
			row.insertCell(2).innerHTML = fieldList[i].type;
		}
		setUpBody();
	}
	this.deleteHTMLTable = function() {
		canvas.removeChild(DOMtable);
	}
	this.unsubAllFields = function() {
		for (let i = 0; i < fieldList.length; i++) {
			fieldList[i].unsubAll();
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
		row.classList.add("table-row");
		row.insertCell(0).innerHTML = (nfield.primK)? "+" : " ";
		row.insertCell(1).innerHTML = nfield.name;
		row.insertCell(2).innerHTML = nfield.type;
		return nfield;
	}
	this.deleteField = function(num) {
		tbody.removeChild(tbody.rows[num]);
		fieldList.splice(num, 1);
	}
	this.updateField = function(num, options) {
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
	this.getField = function(num) {
		return fieldList[num];
	}
	this.getFieldCoords = function(field) {
		let index;
		for (let i = 0; i < fieldList.length; i++) {
			if (fieldList[i]===field) {
				index = i;
				break;
			}
		}
		let row = tbody.children[index];
		let info = {
			x: DOMtable.offsetLeft + row.offsetLeft,
			y: DOMtable.offsetTop + row.offsetTop,
			width: row.offsetWidth,
			height: row.offsetHeight,
			HTMLfield: field,
			table: self.DOMtable
		}
		return info;
	}
	this.getName = function() {
		return name;
	}
	this.setName = function(tname) {
		name = tname || name;
		DOMtable.tHead.rows[0].cells[0].textContent = name;
	}
	this.getClickedFieldParams = function(e) {
		let row = e.target.parentElement;
		let index;
		for(let i = 0; i < tbody.children.length; i++) {
			if(tbody.children[i] == row) {
				index = i;
				break;
			}
		}
		let info = {
			x: DOMtable.offsetLeft + row.offsetLeft,
			y: DOMtable.offsetTop + row.offsetTop,
			width: row.offsetWidth,
			height: row.offsetHeight,
			field: fieldList[index],
			HTMLfield: row,
			table: self
		};
		return info;
	}

	function setUpBody() {
		tbody.onmousedown = function(e) {
			e.stopPropagation();
			let info = self.getClickedFieldParams(e);
			if(!svgLM.waitingEl) {
				svgLM.waitingEl = info;
				info.HTMLfield.classList.add("choosed-field");
				setSidebar(self);
				return;
			}
			if(svgLM.waitingEl.table===info.table) {
				svgLM.waitingEl.HTMLfield.classList.remove("choosed-field");
				svgLM.waitingEl = null;
				return;
			}
			let line = svgLM.drawLine(svgLM.waitingEl, info);
			svgLM.connections.push({ table1: svgLM.waitingEl.table,
								field1HTML: svgLM.waitingEl.HTMLfield,
								field1: svgLM.waitingEl.field,
								table2: info.table,
								field2HTML: info.HTMLfield,
								field2: info.field,
								line: line
			});
			svgLM.waitingEl.HTMLfield.classList.remove("choosed-field");
			svgLM.waitingEl = null;
			setSidebar(self);
		}
		tbody.onselectstart = function() {return false;}
	}

	setUpBody();

	let self = this;
	new function makeDraggable() {
		DOMtable.tHead.onmousedown = mouseDown;
		let shiftX = 0, shiftY = 0;
		let canvasBox = {};
		let connections = [];
		function mouseDown(e) {
			DOMtable.style.zIndex = 1000;
			let clickCoords = getCanvasClickCoords(e);
			shiftX = table.offsetLeft - clickCoords.left;
			shiftY = table.offsetTop - clickCoords.top;
			canvasBox = getCanvasBoxOffset();
			setSidebar(self);
			connections = svgLM.findAllConsByTable(self);
			document.onmousemove = mouseDrag;
			document.onmouseup = stopDrag;
			document.onselectstart = function() {return false;}
		}
		function mouseDrag(e) {
			canvasBox = getCanvasBoxOffset();
			for (let i = 0; i < connections.length; i++) {
				svgLM.updateLine(connections[i]);
			}
			DOMtable.style.left = e.pageX - canvasBox.x + canvasBox.scrollLeft + shiftX + "px";
			DOMtable.style.top = e.pageY - canvasBox.y + canvasBox.scrollTop + shiftY + "px";
		}
		function stopDrag(e) {
			document.onmousemove = null;
			document.onmouseup = null;
			document.onselectstart = null;
			DOMtable.style.zIndex = 0;
		}
	}
}

let svgLineManager = function() {
	this.connections = [];
	this.waitingEl = null;
	this.svg = document.getElementById("svgContainer");
	let self = this;
	this.drawLine = function(field1, field2) {
		let points = calculatePoints(field1, field2);
		let line = document.createElementNS(self.svg.namespaceURI, "polyline");
		let strPoints = points.join(" ");
		line.setAttributeNS(null, "points", strPoints);
		line.setAttributeNS(null, "fill", "none");
		line.setAttributeNS(null, "stroke", "black");
		self.svg.appendChild(line);
		return line;
	}

	function calculatePoints(field1, field2) {
		let left, right;
		let points=[];
		if (field1.x > field2.x) {
			left = field2;
			right = field1;
		} else {
			left = field1;
			right = field2;
		}
		left.y = left.y + left.height/2;
		right.y = right.y + right.height/2;
		if (left.width + left.x < right.x) {
			let mid = right.x - (right.x - (left.x + left.width))/2;
			points.push(left.x + "," + left.y);
			points.push(mid + "," + left.y);
			points.push(mid + "," + right.y);
			points.push(right.x + "," + right.y);
		} else {
			let mid = right.x + right.width + 10;
			points.push(left.x + "," + left.y);
			points.push(mid + "," + left.y);
			points.push(mid + "," + right.y);
			points.push(right.x + "," + right.y);
		}
		return points;
	}

	this.findAllConsByTable = function(table) {
		let lines = [];
		for(let i = 0; i < self.connections.length; i++) {
			if (self.connections[i].table1==table || self.connections[i].table2==table)
				lines.push(self.connections[i]);
		}
		return lines;
	}

	this.updateLine = function(conn) {
		let field1 = conn.table1.getFieldCoords(conn.field1);
		let field2 = conn.table2.getFieldCoords(conn.field2);
		let points = calculatePoints(field1, field2);
		let strPoints = points.join(" ");
		conn.line.setAttributeNS(null, "points", strPoints);
	}

	this.deleteAllFieldConnections = function(field) {
		for (let i = 0; i < self.connections.length; i++) {
			if (self.connections[i].field1===field || self.connections[i].field2===field){
				self.svg.removeChild(self.connections[i].line);
				self.connections.splice(i, 1);
				i--;
			}
		}
	}

	this.deleteConnection = function(conn) {
		for (let i = 0; i < self.connections.length; i++) {
			if (conn===self.connections[i]){
				self.connections.splice(i, 1);
				self.svg.removeChild(conn.line);
				break;
			}
		}
	}

	this.deleteAllTableConnections = function(table) {
		for (let i = 0; i < self.connections.length; i++) {
			if (self.connections[i].table1===table || self.connections[i].table2===table) {
				self.svg.removeChild(self.connections[i].line);
				self.connections.splice(i, 1);
				i--;
			}
		}
	}
}

let svgLM = new svgLineManager();

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
		contextMenu.style.left = parseInt(canvasCSS.width) - parseInt(cMenuCS.width) - 
			parseInt(cMenuCS.borderRight) - 10 + "px";
	}
	if (clickCoords.y + parseInt(cMenuCS.height) > parseInt(canvasCSS.height)) {
		contextMenu.style.top = parseInt(canvasCSS.height) - parseInt(cMenuCS.height) -
			parseInt(cMenuCS.borderBottom) - 10 + "px";
	}
	return false;
}

document.onmousedown = function(e) {
	contextMenu.style.display="none";
	let chooseBox = document.getElementById("typeChooseBox");
			chooseBox.classList.add("hidden");
	if (svgLM.waitingEl) {
		svgLM.waitingEl.HTMLfield.classList.remove("choosed-field");
		svgLM.waitingEl = null;
	}	
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

let temp;
function setSidebar(tableM) {
	let tpanel = document.getElementById("table-panel");
	tpanel.classList.remove("hidden");
	let fpanel = document.getElementById("fields-panel");
	fpanel.classList.remove("hidden");
	let cpanel = document.getElementById("connections-panel");
	cpanel.classList.remove("hidden");
	let fieldsTable = fpanel.firstElementChild;
	let tbody = fieldsTable.tBodies[0];
	for(let i = tbody.children.length-1; i > 0; i--) {
		if(!tbody.children[i].classList.contains("initial")) {
			tbody.removeChild(tbody.children[i]);
		}
	}
	let conTable = cpanel.firstElementChild;
	let conBody = conTable.tBodies[0];
	for(let i = conBody.children.length-1; i > 0; i--) {
		if(!conBody.children[i].classList.contains("initial")) {
			conBody.removeChild(conBody.children[i]);
		}
	}
	let text = document.getElementById("tableName");
	text.value = tableM.getName();
	text.removeEventListener("focusout", temp);
	temp = function() {
		if (text.value != "")
			tableM.setName(text.value);
		else
			text.value = tableM.getName();
	};
	text.addEventListener("focusout", temp);
	function cleanInput(e) {
		let str = e.target.value.replace(/[^а-яА-Яa-zA-Z0-9ёЁ\s]/g, "");
		e.target.value = str;
	}
	text.addEventListener("input", cleanInput, true);
	let initElems = tbody.getElementsByClassName("initial");
	let fields = tableM.getFields();
	for (let i = 0; i < fields.length; i++) {
		let field = fields[i];
		fields[i].index = i;
		let row;
		for (let j = 0; j < initElems.length; j++) {
			if(initElems[j].getAttribute("data-content") == "field-param"){
				row = initElems[j].cloneNode(true);
				break;
			}
		}
		tbody.appendChild(row);
		fieldBinder(row, field, i);
	}

	connectionBinder(tableM);


	function fieldBinder(HTMLrow, field) {
		HTMLrow.classList.remove("initial");

		let checkBoxOnChange = function(e) {
			let options = {
				[this.name]: this.checked
			};
			field.editField(options);
			tableM.updateField(field.index, options);
		}

		let dragbtn = HTMLrow.cells[0].firstElementChild;
		dragbtn.textContent = '\u21C5';

		let input = HTMLrow.cells[1].firstElementChild;
		input.value = field.name;
		input.addEventListener("input", cleanInput, true);
		input.addEventListener("focusout", function(e) {
			if (input.value != "") {
				field.name = input.value;
				tableM.updateField(field.index, { name: field.name});
			}
			else
				input.value = field.name;
		});

		let typecell = HTMLrow.cells[2].firstElementChild;
		let typeTextArea = typecell.firstElementChild;
		let typeBtn = typecell.lastChild;
		typeTextArea.value = field.type;
		typeTextArea.addEventListener("input", cleanInput, true);
		typeTextArea.addEventListener("focusout", function(e) {
			if(this.value != "") {
				field.type = this.value;
				tableM.updateField(field.index, { type: field.type});
			}
			else
				this.value = field.type;
		});
		typeBtn.onclick = function(e) {
			let chooseBox = document.getElementById("typeChooseBox");
			chooseBox.classList.remove("hidden");
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
						tableM.updateField(field.index, { type: typeTextArea.value});
						collection[i].checked = false;
						break;
					}
				}
				chooseBox.classList.add("hidden");
			}			
		}

		let primChBox = HTMLrow.cells[3].firstElementChild;
		primChBox.checked = (field.primK)? true: false;
		primChBox.addEventListener("change", checkBoxOnChange, true);
		field.subscribe(function(opts){
			primChBox.checked = (opts.primK!=null)? opts.primK: primChBox.checked;
		});

		let nullChBox = HTMLrow.cells[4].firstElementChild;
		nullChBox.checked = (field.nullable)? true: false;
		nullChBox.addEventListener("change", checkBoxOnChange, true);
		field.subscribe(function(opts) {
			if (opts.primK) {
				nullChBox.checked = false;
				nullChBox.disabled = true;
				return;
			}
			if (opts.primK == false) {
				nullChBox.disabled = false;
			}
			nullChBox.checked = (opts.nullable!=null)? opts.nullable: nullChBox.checked;
		});

		let detbtn = HTMLrow.cells[5].firstElementChild;
		let detRow;
		for (let i = 0; i < initElems.length; i++) {
			if (initElems[i].getAttribute("data-content")=="field-det"){
				detRow = initElems[i].cloneNode(true);
				break;
			}
		}
		new function createDetailRow() {
			let cell = detRow.cells[0];
			let inputCheckElem = cell.querySelectorAll("input[type='checkbox']");
			let autoincCheck;
			for (let i = 0; i < inputCheckElem.length; i++) {
					inputCheckElem[i].checked = field[inputCheckElem[i].name] ? true: false;
					inputCheckElem[i].addEventListener("change", checkBoxOnChange, true);
					if(inputCheckElem[i].name=="autoinc")
						autoincCheck=inputCheckElem[i];
					if(inputCheckElem[i].name=="nullable") {
						let nCB = inputCheckElem[i];
						field.subscribe(function(opts) {
							if (opts.primK) {
								nCB.checked = false;
								nCB.disabled = true;
								return;
							}
							if (opts.primK == false) {
								nCB.disabled = false;
							}
							nCB.checked = (opts.nullable!=null)? opts.nullable: nCB.checked;
						});
					}
					if(inputCheckElem[i].name=="primK") {
						let pCB = inputCheckElem[i];
						field.subscribe(function(opts){
							pCB.checked = (opts.primK!=null)? opts.primK: pCB.checked;
						});
					}
			}
			let inputTextElem = cell.querySelectorAll("input[type='text']");
			for (let i = 0; i < inputTextElem.length; i++) {
				inputTextElem[i].addEventListener("input", cleanInput, true);
				inputTextElem[i].addEventListener("focusout", function(e) {
					field[this.name] = this.value;
					tableM.updateField(field.index, {[this.name]: this.value});
				});
			}
			if(autoincCheck.checked) {
				for (var i = 0; i < inputTextElem.length; i++) {
					inputTextElem[i].disabled = false;
					inputTextElem[i].value = field[inputTextElem[i].name];
				}
			} else {
				for (var i = 0; i < inputTextElem.length; i++)
					inputTextElem[i].disabled = true;
			}
			autoincCheck.addEventListener("change", function(e) {
				if(this.checked) {
					for (var i = 0; i < inputTextElem.length; i++)
						inputTextElem[i].disabled = false;
				} else {
					for (var i = 0; i < inputTextElem.length; i++)
						inputTextElem[i].disabled = true;
				}
			});
			tbody.insertBefore(detRow, HTMLrow.nextElementSibling);
			detRow.classList.remove("initial");
			detRow.classList.add("hidden");
		}
		detbtn.onclick = function(e) {
			detRow.classList.toggle("hidden");
			resizeAccordion(fpanel);
		}

		let delbtn = HTMLrow.cells[6].firstElementChild;
		delbtn.onclick = function(e) {
			svgLM.deleteAllFieldConnections(field);
			fields.splice(field.index, 1);
			tbody.removeChild(HTMLrow);
			tbody.removeChild(detRow);
			tableM.deleteField(field.index);
			for(let i = conBody.children.length-1; i > 0; i--) {
				if(!conBody.children[i].classList.contains("initial")) {
					conBody.removeChild(conBody.children[i]);
				}
			}
			connectionBinder(tableM);
			resizeAccordion(fpanel);
			resizeAccordion(cpanel);
			for (let i = 0; i < fields.length; i++) {
				fields[i].index = i;
			}
		}
	}

	function connectionBinder(tableM) {
		let initRow = conBody.getElementsByClassName("initial")[0];
		let cons = svgLM.findAllConsByTable(tableM);
		for (let i = 0; i < cons.length; i++) {
			let con = cons[i];
			let row = initRow.cloneNode(true);
			row.classList.remove("initial");
			let fieldCell = row.cells[0];
			fieldCell.textContent = 
				(con.table1===tableM)? con.field1.name: con.field2.name;
			let dstFieldCell = row.cells[1];
			dstFieldCell.textContent = 
				(con.table1===tableM)? 
				con.table2.getName() +"."+ con.field2.name: 
				con.table1.getName() +"."+ con.field1.name;
			let delbtn = row.cells[2].firstElementChild;
			delbtn.onclick = function(e) {
				svgLM.deleteConnection(con);
				conBody.removeChild(row);
				resizeAccordion(cpanel);
			}
			conBody.appendChild(row);
		}
	}

	function resizeAccordion(elem) {
		elem.style.maxHeight = null;
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
		let nfield = tableM.appendField(options);
		let row = tbody.getElementsByClassName("initial")[0].cloneNode(true);
		row.classList.remove("initial");
		tbody.appendChild(row);
		fieldBinder(row, nfield, fields.length);
		fields.push(nfield);
		resizeAccordion(fpanel);
		for (let i = 0; i < fields.length; i++) {
				fields[i].index = i;
		}
	}
	if(tpanel.previousElementSibling.classList.contains("active"))
		resizeAccordion(tpanel);
	if(fpanel.previousElementSibling.classList.contains("active"))
		resizeAccordion(fpanel);
	if(cpanel.previousElementSibling.classList.contains("active"))
		resizeAccordion(cpanel);
	let delbtn = tpanel.getElementsByClassName("delbutton")[0];
	delbtn.onclick = function(e) {
		svgLM.deleteAllTableConnections(tableM);
		let index;
		for (let i = 0; i < tableList.length; i++) {
			if(tableM === tableList[i]) {
				index = i;
				break;
			}
		}
		tableList[index].deleteHTMLTable();
		tableList.splice(index, 1);
		unsetSidebar();
	}
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

function unsetSidebar() {
	let tpanel = document.getElementById("table-panel");
	tpanel.classList.add("hidden");
	let fpanel = document.getElementById("fields-panel");
	fpanel.classList.add("hidden");
	let cpanel = document.getElementById("connections-panel");
	cpanel.classList.add("hidden");
	[].forEach.call(accordions, function(elem) {
		elem.classList.remove("active");
		elem.nextElementSibling.style.maxHeight = null;
	});
	let fieldsTable = fpanel.firstElementChild;
	let tbody = fieldsTable.tBodies[0];
	for(let i = tbody.children.length-1; i > 0; i--) {
		if(!tbody.children[i].classList.contains("initial")) {
			tbody.removeChild(tbody.children[i]);
		}
	}
	let conTable = cpanel.firstElementChild;
	let conBody = conTable.tBodies[0];
	for(let i = conBody.children.length-1; i > 0; i--) {
		if(!conBody.children[i].classList.contains("initial")) {
			conBody.removeChild(conBody.children[i]);
		}
	}
	for (let i = 0; i < tableList.length; i++) {
		tableList[i].unsubAllFields();
	}
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
		name: "Поле0",
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

let genSQL = document.getElementById("generateSQL");
genSQL.onclick = function(e) {
	let sqlForm = document.getElementById("sql-form");
	let coverDiv = document.createElement("div");
	coverDiv.id = "cover-div";
	coverDiv.onmousedown = function(e){e.stopPropagation();}
	document.body.appendChild(coverDiv);
	sqlForm.parentElement.style.display = "block";
	sqlForm.style.display = "block";
	let radioBtns = sqlForm.querySelectorAll("input[type='radio']");
	let sqlTextElem = sqlForm.getElementsByClassName("sql-query")[0];
	for(let i = 0; i < radioBtns.length; i++) {
		radioBtns[i].onchange = function(e) {
			if (this.checked) {
				let query;
				if (this.value == "MSSQLServer")
					query = createMSSQLQuery();
				if (this.value == "MySQL") 
					query = createMySQLQuery();
				console.log(this, this.value, sqlTextElem);
				sqlTextElem.removeAttribute("readonly");
				sqlTextElem.value = query;
				sqlTextElem.setAttribute("readonly", "true");
			}
		}
	}
	radioBtns[0].checked = true;
	radioBtns[0].onchange();
	function createMSSQLQuery() {
		let tableCreateStr = "";
		for (let i = 0; i < tableList.length; i++) {
			tableCreateStr += "CREATE TABLE " + tableList[i].getName() + "(\n";
			let fields = tableList[i].getFields();
			for (let i = 0; i < fields.length; i++) {
				tableCreateStr += fields[i].name + " " + fields[i].type;
				if(!fields[i].nullable)
					tableCreateStr += " NOT NULL";
				if(fields[i].autoinc){
					if (!fields[i].idInitVal)
						fields[i].idInitVal=1;
					if (!fields[i].idStep)
						fields[i].idStep=1;
					tableCreateStr += " IDENTITY("+
						fields[i].idInitVal+","+fields[i].idStep+")";
				}
				if(fields[i].primK)
					tableCreateStr += " PRIMARY KEY";
				tableCreateStr += ",\n";
			}
			tableCreateStr += ");\n GO\n";
		}
		let connCreateStr = "";
		for(let i = 0; i < svgLM.connections.length; i++) {
			let con = svgLM.connections[i];
			connCreateStr += "ALTER TABLE " + con.table1.getName() + 
				" ADD CONSTRAINT " + "FK_" + con.table1.getName() + con.field1.name +
				"_" + con.table2.getName() + con.field2.name + " FOREIGN KEY (" +
				con.field1.name + ") REFERENCES " + con.table2.getName() + "(" + 
				con.field2.name + ")\n ON DELETE CASCADE\n ON UPDATE CASCADE \n;\n GO\n";
		}
		return tableCreateStr+connCreateStr;
	}
	function createMySQLQuery() {
		let tableCreateStr = "";
		for (let i = 0; i < tableList.length; i++) {
			let primField;
			tableCreateStr += "CREATE TABLE " + tableList[i].getName() + "(\n";
			let fields = tableList[i].getFields();
			for (let i = 0; i < fields.length; i++) {
				tableCreateStr += fields[i].name + " " + fields[i].type;
				if(!fields[i].nullable)
					tableCreateStr += " NOT NULL";
				if(fields[i].autoinc){
					tableCreateStr += " AUTO_INCREMENT";
				}
				if(fields[i].primK)
					primField = fields[i];
				tableCreateStr += ",\n";
			}
			if(primField)
				tableCreateStr += "PRIMARY KEY("+primField.name+")\n";
			tableCreateStr += ");\n";
		}
		let connCreateStr = "";
		for(let i = 0; i < svgLM.connections.length; i++) {
			let con = svgLM.connections[i];
			connCreateStr += "ALTER TABLE " + con.table1.getName() + 
				" ADD CONSTRAINT " + "FK_" + con.table1.getName() + con.field1.name +
				"_" + con.table2.getName() + con.field2.name + " FOREIGN KEY (" +
				con.field1.name + ") REFERENCES " + con.table2.getName() + "(" + 
				con.field2.name + ");\n";
		}
		return tableCreateStr+connCreateStr;
	}
	let btn = sqlForm.getElementsByTagName("button")[0];
	btn.onclick = function(e) {
		document.body.removeChild(coverDiv);
		sqlForm.parentElement.style.display = "none";
		sqlForm.style.display="none";
	}
}
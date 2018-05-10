var body = document.body;
body.onclick = function(e) {
	if(e.which != 1)
		return;
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
	//table.className = "table-fields-container";
	table.style.width = 100;
	var initRow = table.insertRow(0);
	//initRow.className = "table-fields-elements";
	initRow.insertCell(0).innerHTML = "Cell 1";
	initRow.insertCell(1).innerHTML = "Cell 2";
	div.appendChild(table);
	//alert("x = " + e.pageX + "\ny = " + e.pageY + "\nwhich = " + e.which);
	div.style.left = e.pageX + "px";
	div.style.top = e.pageY + "px";
	body.appendChild(div);
}
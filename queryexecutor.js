var parser = require('./sqlparser').parser;

/*

Interface Cursor:
 Constructor - has to initialize the first walkthrough
 function reset() - restart walking through the data.
 function fetch() - return object containing the data of the next row. return undefined or null if no rows left
 function close() - shut down all observers and close all sub-cursors
 function getSchema() - return an array of fields of the form [identifier, type]
A storage backend has to implement that interface. Also all relational operations like selections, projections, cross-joins, index-joins, groups are cursors.


*/

function SQLinMemory() {
	var tables = {};

	function tableIterator() {
		var keys, cursor;
		this.reset = function() {
			keys = ['TABLES'];
			for(tab in tables) {
				keys.push(tab);
			}
			cursor = 0;
		};
		this.reset();
		this.close = function() {
		}
		this.fetch = function() {
			if(cursor < keys.length) {
				// fetch one row
				var tuple = {IDENTIFIER: keys[cursor]};
				// move cursor one further
				while(cursor < keys.length && !tables[keys[cursor]]) {
					cursor++;
				}
				return tuple;
			}
		}
		this.getSchema = function() {
			return [['IDENTIFIER', 'TEXT']];
		}
	}
	function convertStringForAttribute(str, obj) {
		if(obj.hasOwnProperty(str)) return str;
		str = str.toUpperCase();
		for(var i in obj) {
			if(i.toUpperCase() == str)
				return i;
		}
	}
	function getTableIterator(identifier) {
		if(identifier.toUpperCase() == 'TABLES')
			return new tableIterator();
		// TODO: also return tables
	}
	this.query = function(sql) {
		var query = parser.parse(sql);
		console.log(JSON.stringify(query));
		if(query.type == 'select') {
			if(query.from) {
				var from = getTableIterator(query.from);
				return from;
				// TODO: select etc.
			}
		}
	}
}

function printTable(table, print) {
	print = print || console.log;
	var schema = table.getSchema();
	var line = '';
	for(var i in schema) {
		line += schema[i][0] + '; ';
	}
	print(line);
	print(line.replace(/./g, '-'));
	var tuple;
	while(tuple = table.fetch()) {
		line = '';
		for(var i in schema) {
			line += tuple[schema[i][0]] + '; ';
		}
		print(line);
	}
}

if(typeof exports) {
	exports.SQLinMemory = SQLinMemory;
	exports.printTable = printTable;
}

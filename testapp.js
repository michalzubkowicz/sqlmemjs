var sql = require('./queryexecutor');
var SQLinMemory = sql.SQLinMemory;

var db = new SQLinMemory();

db.query('SELECT 1+2').assert([{col0: 3}]);
db.query('SELECT 1+2 AS sum').assert([{sum: 3}]);
db.query('SELECT 2+2*2 as sum').assert([{sum: 6}]);
db.query('SELECT -1*3 as a, 3/4 as b').assert([{a: -1*3, b: 3/4}]);
db.query('SELECT a+b FROM (SELECT -1*3 as a, 3/4 as b)').assert([{col0: -1*3+3/4}]);
db.query("SELECT 1+(select 2+3)").assert([{col0: 6}]);
db.query('SELECT sqrt(?)', 9).assert([{col0: 3}]);
db.query("SELECT 'Monikas Imbiss' UNION SELECT 'abc123'").assert([{col0: 'Monikas Imbiss'}, {col0: 'abc123'}]);
db.query("SELECT 'Monika\\'s Imbiss'").assert([{col0: 'Monika\'s Imbiss'}]);
db.query("CREATE TABLE IF NOT EXISTS person(ID integer PRIMARY KEY AUTO_INCREMENT, Name string COMMENT 'Name of the Person', Age NUMBER DEFAULT 18)").assert([{VALUE: 'person'}]);
db.query("CREATE TABLE IF NOT EXISTS person(ID integer PRIMARY KEY AUTO_INCREMENT, Name string COMMENT 'Name of the Person', Age NUMBER DEFAULT 18)").printTable();
db.query("SELECT * FROM tables").printTable();
db.query("SELECT tables.* FROM tables").printTable();
db.query("SHOW TABLES").printTable();
db.query("SELECT * FROM tables as t1, tables as `t2`").printTable();
db.query("INSERT INTO person(Name, age) VALUES (?, 15), (?, 88)", "Hans", "Anton").printTable();
db.query("INSERT INTO person(Name, AGE) VALUES (?, ?)", 'Paul', 55).printTable();
var hanna = db.query("INSERT INTO person(Name) VALUES ('Hanna')").insert_id;
var exported = db.exportJSON();

console.log('');
console.log(' ---- exporting/importing ---- ');
console.log(JSON.stringify(exported));
console.log('');

db = new SQLinMemory();
db.importJSON(exported);
var getPerson = db.prepare("SELECT * FROM `person` WHERE ID=?");
db.query(getPerson, hanna).printTable();
db.query("UPDATE person SET Name='Eva', Age = Age+1 WHERE id=?", hanna).printTable();
db.query("SELECT * FROM `person`").printTable();
db.query("SELECT *, ? FROM `person` WHERE age > ?", 12, 30).printTable();
db.query("SELECT Name, (SELECT age+?) as nextage FROM `person`", 2).printTable();
db.query("DELETE * FROM `person` WHERE id=?", hanna).printTable();
db.query("INSERT INTO person(Name, Age) SELECT Name, Age+? FROM person WHERE Age < 100", 20);
db.query("SELECT * FROM `person`").printTable();

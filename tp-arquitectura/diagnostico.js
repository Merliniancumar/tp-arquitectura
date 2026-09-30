// Diagnóstico.js
console.log ("Diagnostico del entorno");
console.log ("Versión de Node.js: " + process.version);
console.log ("Plataforma: " + process.platform);
console.log("Argumentos recibidos: " + process.argv.slice(2));
console.log("Variable de entorno EJEMPLO: " + process.env.EJEMPLO || "(No definida)")
;

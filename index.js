
const readline = require("node:readline");

// ========================================
// LÚMINA - SISTEMA DE APOYO VISUAL
// Control de activación por botón
// Modo de prueba en computadora
// ========================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

let procesando = false;
let numeroActivaciones = 0;
let cerrando = false;

// Mostrar información inicial
function iniciarSistema() {
    console.clear();

    console.log("========================================");
    console.log("              LÚMINA");
    console.log("        SISTEMA DE APOYO VISUAL");
    console.log("========================================");
    console.log("");
    console.log("Presiona ENTER para simular el botón.");
    console.log("Escribe SALIR para cerrar el programa.");
    console.log("");
    console.log("----------------------------------------");
}

// Simular la pulsación del botón físico
async function botonPresionado() {
    if (procesando || cerrando) {
        console.log("Lúmina está procesando una activación.");
        return;
    }

    procesando = true;
    numeroActivaciones++;

    try {
        console.log("");
        console.log("========================================");
        console.log(`ACTIVACIÓN N.º ${numeroActivaciones}`);
        console.log("========================================");

        await prepararCaptura();

        await prepararVisionArtificial();

        await prepararRespuestaVoz();

        console.log("");
        console.log("Fin de la simulación.");
        console.log("----------------------------------------");

    } catch (error) {
        console.error("Error durante la activación:", error.message);

    } finally {
        procesando = false;

        if (!cerrando) {
            console.log("");
            console.log("Presiona ENTER para volver a probar.");
        }
    }
}

// Punto de integración para la captura de imagen
async function prepararCaptura() {
    console.log("[1/3] Captura de imagen");
}

// Punto de integración para visión artificial
async function prepararVisionArtificial() {
    console.log("");
    console.log("[2/3] Visión artificial");
}

// Punto de integración para respuesta por voz
async function prepararRespuestaVoz() {
    console.log("");
    console.log("[3/3] Respuesta por voz");
}

// Leer las instrucciones de la terminal
rl.on("line", async (entrada) => {
    const comando = entrada.trim().toLowerCase();

    if (comando === "salir") {
        cerrando = true;
        console.log("");
        console.log("Cerrando Lúmina...");
        rl.close();
        return;
    }

    if (comando === "") {
        await botonPresionado();
        return;
    }

    console.log("Comando no reconocido.");
    console.log("Presiona ENTER para activar o escribe SALIR.");
});

rl.on("close", () => {
    console.log("Sistema finalizado.");
});

iniciarSistema();

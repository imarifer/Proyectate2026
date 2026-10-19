//Importar onoff para poder administrar el trigger del botón
//const Gpio = require('onoff').Gpio;
//Importar exec para poder capturar la imágen con la cámara
//Importar spawn para un control más detallado de los procesos
const { exec, spawn } =  require('child_process');
//Importamos la función para el análisis de la imágen con Gemini 
const analizarImagen = require('../services/servicioGemini');
//Importamos la función para la generación de audio con TTS
const textSpeech2 = require('../services/servicioTTS2');
//Importamos el modulo que nos va permitir acceder a la ruta de los audios que no van a cambiar(estáticos)
const path = require('path');

const monitorearLinea = spawn('gpiomon', ['--bias', 'pull-up', '-c', 'gpiochip0', '17']);
monitorearLinea.stdout.on('data', (data) => {
    const estado = data.toString();

    if(estado.includes('falling')){
        console.log("El botón se presiono correctamente");
    }else{
        console.log(estado);
    }
});
/*
//Establecer el pin GPIO como entrada para el botón
console.log("Hemos llegado antes del error")
const button = new Gpio(17, 'in', 'both', {debounceTimeout: 200});
console.log("Hemos llegado despues del error")
console.log("Se ha configurado el pin  GPIO 17 como entrada de forma correcta");

//Definimos una variable que servira como bandera para poder controlar un análisis a la vez
let bandera = false;

button.watch(async (error, valor) => {
    if(error){
        console.log("Error en el pin GPIO 17, al presionar el botón");
    }
    //Validamos que el valor sea 0, indicando que el botón se ha presionado
    //Si se detecta que el botón está en estado normal entonces no hace nada
    if(valor !== 0){
        return;
    }

    //Si el valor es 0, tenemos que validar con una bandera que no se encuentre en procesamiento
    if(bandera){
        console.log("El sistema se encuentra procesando ya una imágen");
        return;
    }
    //Si no se encuntra en procesamiento entonces activamos la bandera y mandamos a llamar las funciones correspondientes
    bandera = true;
    //Activamos el camera-shutter
    try{
        //Obtenemos la ruta completa del sonido de camera-shutter uniendo desde el proceso donde se está ejecutando
        const rutaC = path.join(process.cwd(), 'assets', 'camera-shutter.wav');
        await reproducirSonido(rutaC);
    }catch(error){
        console.log("Se genero un error al lanzar sonido camera-shutter", error);
    }finally{
        const rutaP = path.join(process.cwd(), 'assets', 'process.wav');
        const matarSonido = reproducirSonidoParalelo(rutaP);
        //Mandamos a llamar a la función que activa el driver para capturar la imágen desde el módulo de la cámara
        try{
            await procesarImagen();
        }catch(error){
            try{
                //Obtenemos la ruta completa del sonido error-beep
                const rutaE = path.join(process.cwd(), 'assets', 'error-beep.wav');
                //Reproducimos el sonido de error-beep
                await reproducirSonido(rutaE);
            }catch(error){
                console.log("Se genero un error al lanzar sonido error-beep");
            }
            console.log("Error dentro del flujo al tratar de realizar el procesamiento de la imágen", error);
        }finally{
            //Matamos el proceso que está reproduciendo el sonido process
            matarSonido();
            //Generamos el cambio dentro de la variable bandera para poder procesar otra captura 
            bandera = false;
            console.log("Se puede empezar con un nuevo procesamiento");
        }
    }
});

//Función que se encarga de mandar el buffer de la imágen dentro de la función de procesamiento de Gemini
const procesarImagen = async () => {
    //Obtenemos el buffer de la imágen desde el proceso disparado desde 'generarBuffer' con exec
    try{
        const bufferImagen = await generarBuffer();
        const descripcion = await analizarImagen(bufferImagen);
        const contenidoDescripcion = descripcion.content || 'Algo sucedio con la captura que no se pudo generar el audio descriptivo';
        await textSpeech2(contenidoDescripcion);
    }catch(error){
        console.error("Se genero un error en el flujo de procesamiento de la función principal");
        //Volvemos a propagar el error para que el catch en donde se ejecuta la función pueda resolver
        throw error;
    }
}

//Función que activa el driver para capturar la imágen, regresandola como un buffer de datos sin parseo a String
const generarBuffer = () => {
    return new Promise((resolve, reject) => {
        const comando = 'rpicam-still -o - -n -t 300 --width 1280 --height 960';
        //Mandamos a llamar el comando exec como un proceso hijo dentro de Node.js
        exec(comando, {encoding: 'buffer', maxBuffer: 10 * 1024 * 1024}, (error, stdout, stderr) => {
            if(error){
                return reject(error); 
            }
            resolve(stdout);
        });
    });
}

//Función que reproduce los audios para la experiencia de usuario
const reproducirSonido = (ruta) => {
    return new Promise((resolve, reject) => {
        exec(`aplay ${ruta}`, (error, stdout, stderr) => {
            if(error){
                return reject(error);
            }
            resolve();
        });
    })
}

//Función que va a permitir mandar la reproducción del sonido durante el procesamiento a 2do plano
const reproducirSonidoParalelo = (ruta) => {
    const procesoParalelo = spawn('aplay', ['-q', '--loop=0', ruta]);
    return () => {
        if(procesoParalelo && !procesoParalelo.killed){
            procesoParalelo.kill('SIGKILL');
        }
    }
}

//Liberamos el pin GPIO 17 cuando se cierra el programa para no mantenerlo en uso 
process.on('SIGINT', () => {
    button.unexport();
    process.exit();
});

*/
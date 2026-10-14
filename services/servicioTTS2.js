const { spawn } = require('child_process');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const webSocket = require('ws');
const dotenv = require('dotenv');

dotenv.config();

global.WebSocket = webSocket;

//Configuramos la apiKey y la región
const apiKey = process.env.SPEECH_API_KEY;
const region = 'eastus';

const textSpeech2 = (texto) => {
    return new Promise((resolve, reject) => {
        console.log("Estamos comenzando con el análisis de audio");
        //Ya no se generará el nombre de un archivo en variable debido a que se reproduciera en cuanto se análice la imágen
        //Creamos el objeto de configuración del servico
        const speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
        //Agregamos valores de configuración al objeto
        speechConfig.speechSynthesisVoiceName = 'es-MX-DaliaNeural';
        speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;
        //No se configura una variable con el nombre para el archivo de salida
        const sintetizador = new sdk.SpeechSynthesizer(speechConfig, null);
        try{
            const timer = setTimeout(() => {
                reject(new Error("Se acabó el tiempo dentro de la promesa del Promise"));
            }, 16000);
            sintetizador.speakTextAsync(
                texto, 
                    (resultado) => {
                        console.log("Estamos dentro de la callback");
                        if(resultado.reason === sdk.ResultReason.SynthesizingAudioCompleted){
                            //Pasamos los datos generados por Azure TTS a un buffer que pueda manipular Node.js
                            const bufferAudio = Buffer.from(resultado.audioData);
                            //Ejecutamos el comando que nos permite reproducir el audio desde el proceso hijo 'spawn'
                            //Se prepara el comando para recibir el buffer desde la entrada estabdar
                            const reproductor = spawn('mpg123', ['-']);
                            //Escribimos directamente el buffer del audio en la entrada estándar en el proceso hijo programado
                            reproductor.stdin.write(bufferAudio);
                            //Cerramos la entrada estandar para no recibir más datos
                            reproductor.stdin.end();
                            //Reproducimos el buffer que se recibio, y cuando se termina especificamos que se debe hacer para cerrar el reproductor
                            reproductor.on('close', () => {
                                sintetizador.close();
                                resolve({value: true});
                            });
                            //Definimos lo que se debe hacer en caso de error en el reproductor
                            reproductor.on('error', () => {
                                sintetizador.close();
                                reject(new Error('Ocurrio un error dentro del reproductor'));
                            });
                            clearTimeout(timer);
                        }else{
                            console.log("Algo no cuadro dentro de la reason");
                            clearTimeout(timer);
                            reject(new Error('Ocurrio un error con al generar el resultado con el sintetizador', resultado.errorDetails));
                        }
                    },
                    (error) => {
                        reject(new Error('Ocurrio un error con el sintetizador', error));
                    }
            );
        }catch(error){
            console.error("Se genero un error dentro del sintetizador en TTS");
        }
    });
};

/*
const textSpeech = async (texto) => {
        console.log("Estamos comenzando con el análisis de audio");
        console.log(texto);
        const outputFile = 'output.mp3';
        //Creamos el objeto de configuración del servico
        const speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
        //Agregamos valores de configuración al objeto
        speechConfig.speechSynthesisVoiceName = 'es-MX-DaliaNeural';
        speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;
        const configAudio = sdk.AudioConfig.fromAudioFileOutput(outputFile);
        const sintetizador = new sdk.SpeechSynthesizer(speechConfig, configAudio);
        try{
            console.log("Estamos dentro del try intentando")
            console.log(texto);
            const resultadoAudio = await new Promise(
                (resolve, reject) => {
                    console.log("Entramos para usar el sintetizador");
                    const timer = setTimeout(() => {
                        reject(new Error("Se acabó el tiempo dentro de la promesa del Promise"));
                    }, 16000);
                    sintetizador.speakTextAsync(
                        texto, 
                        (resultado) => {
                            console.log("Estamos dentro de la callback");
                            if(resultado.reason === sdk.ResultReason.SynthesizingAudioCompleted){
                                clearTimeout(timer);
                                resolve(resultado);
                            }else{
                                console.log("Algo no cuadro dentro de la reason");
                                clearTimeout(timer);
                                reject(new Error(resultado.errorDetails));
                            }
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                }
            );
            console.log("El audio se encuentra dentro de la ruta definida");
            return {value: true, content: "Audio en la ruta correspondiente"};
        }catch(error){
            console.error("Error dentro del servicio de text to speech en Azure", error);
            return {value: false, content: "Ocurrió un error dentro del sintetizador"};
        }finally{
            sintetizador.close();
        }
}*/

module.exports = textSpeech2;
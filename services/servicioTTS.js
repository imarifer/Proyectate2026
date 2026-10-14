const sdk = require('microsoft-cognitiveservices-speech-sdk');
const webSocket = require('ws');
const dotenv = require('dotenv');

dotenv.config();

global.WebSocket = webSocket;

//Configuramos la apiKey y la región
const apiKey = process.env.SPEECH_API_KEY;
const region = 'eastus';

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
}

module.exports = textSpeech;
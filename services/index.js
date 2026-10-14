const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');
const analizarImagen = require('./servicioGemini');
const textSpeech = require('./servicioTTS');

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

//Inicializamos express para levantar el servidor
const app = express();

//Uso de middleware para parsear a json
app.use(express.json());

//Definir el puerto
const PORT = process.env.PORT || 3000;

//Generamos un get para ver que el backend funciona correctamente
app.get('/', (req, res) => {
    res.send("Backend corriendo correctamente");
});

//Generamos dos post para el análisis y tts
app.post('/analizarImagen', upload.single('imagenPrueba'), async (req, res) => {
    console.log("Se logro entrar");
    try{
        console.log("Iniciando el analisis");
        //Obtener el buffer de datos de la imágen 
        const dataImage = req.file.buffer;
        console.log(dataImage);
        //Mandamos a llamar al servicio correspondiente
        const respuesta = await analizarImagen(dataImage);
        //Validamos la respuesta del servicio de Gemini 
        if(respuesta.value){
            console.log("Analisis correcto desde el servidor");
            const textoString = String(respuesta.content);
            const respuestaSpeech = await textSpeech(textoString);
            if(respuestaSpeech.value){
                res.send({value: true, content: respuesta.content});
            }else{
                res.send({value: false, content: "Error en la generación de audio"});
            }
        }else{
            console.log("Error en el anslisis en el servidor");
            res.send({value: false, content: "Error de análisis en el servidor"});
        }
    }catch(error){
        console.error("Error en el endpoint para conectar con el servicio de análisis: ", error);
        res.send({value: false, content: "Error en el análisis"});
    }
});

app.post('/servicioTTS', async (req, res) => {
    try{
        const texto = req.body.texto;
        const response = await textSpeech(texto);
        if(response.value){
            res.send({value: true});
        }
    }catch(error){
        console.error("Error en el endpoint para conectar con el servicio TTS: ", error);
        res.send({value: false});
    }
});

app.listen(PORT, () => {
    console.log("Servidor corriendo correctamente");
    console.log(`http://localhost:${PORT}`);
});
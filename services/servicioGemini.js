const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

//Configuramos el servicio de Gemini
//La utilizamos cuando se suba al repositorio, con las variables de entorno
//const servicioGemini = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
//Lo utilizamos para pruebas
const servicioGemini = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

//Pasamos el buffer de la imágen para procesarla
const analizarImagen = async (bufferImage) => {
    try {
        //Parseamos el buffer(0 a 1) a string
        const stringBuffer = {
            inlineData: {
                data: bufferImage.toString('base64'),
                mimeType: 'image/jpeg'
            }
        }

        //Construimos el prompt para mandar al modelo
        const prompt = `
        REGLAS DE SALIDA:
        1. Longitud: Máximo 2 oraciones (menos de 25 palabras).
        2. Prioridad: 
        a) Si hay texto clave (letreros, etiquetas, menús, marcas), léelo o resúmelo primero.
        b) Si hay un obstáculo o peligro inmediato, adviértelo de primero.
        c) Si es un entorno general o un objeto, descríbelo de forma concisa.
        3. Formato: Habla en primera persona directamente al usuario. No uses introducciones como "En la imagen veo", "Observo un", ni listas.
        4. Idioma: Español neutro y claro.
        `;

        const response = await servicioGemini.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
                "Eres un asistente de visión artificial para una persona ciega. Analiza la imagen y genera una respuesta directa para ser leída por voz.",
                stringBuffer,
            ],
            config: {
                systemInstruction: prompt,
                responseMimeType: 'text/plain',
            }
        });
        console.log(response);
        console.log(response.text);
        return {value: true, content: response.text};

    } catch(e) {
        console.log("Hubo un error al analizar la imagen: ", e);
        return {value: false, content: "Error de procesamiento"};
    }
}

module.exports = analizarImagen;
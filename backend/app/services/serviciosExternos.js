const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function identificarEspecie(imageUrl) {
  try {
    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&images=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error en Pl@ntNet Especies");
    
    const data = await response.json();
    const mejorResultado = data.results?.[0];
  
    return {
      especie: mejorResultado?.species?.scientificNameWithoutAuthor || "Especie desconocida",
      certeza: mejorResultado?.score ? (mejorResultado.score * 100) : 0
    };
  } catch (error) {
    console.error(error);
  }
}

export async function identificarEnfermedad(imageUrl) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error("No se pudo descargar la imagen de prueba para reenviar");
    const imageBlob = await imageResponse.blob();

    const url = `https://my-api.plantnet.org/v2/diseases/identify?include-related-images=true&no-reject=false&nb-results=10&lang=es&api-key=${PLANTNET_API_KEY}`;
    const formData = new FormData();

    formData.append("images", imageBlob, "planta.jpeg");
    formData.append("organs", "auto");

    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error("Error en Pl@ntNet Diseases");
    
    const data = await response.json();
    const mejorPatologia = data.results?.[0];
 
    return {
      diagnostico: mejorPatologia?.description,
      certeza: mejorPatologia?.score ? (mejorPatologia.score * 100) : 0
    };
  } catch (error) {
    console.error(error);
  }
}
const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;

// Identifica la especie botánica de una planta usando la API de Pl@ntNet
export async function identifySpecies(imageInput) {
  try {
    let response;
    // Si la entrada es un string, asumimos que es una URL publica de imagen (metodo GET)
    if (typeof imageInput === "string") {
      const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&images=${encodeURIComponent(imageInput)}`;
      response = await fetch(url);
    // Si es un objeto de archivo subido (con buffer), enviamos la foto en binario vía POST multipart/form-data
    } else if (imageInput && imageInput.buffer) {
      const url = `https://my-api.plantnet.org/v2/identify/all?include-related-images=false&no-reject=false&nb-results=10&lang=es&api-key=${PLANTNET_API_KEY}`;
      const formData = new FormData();
      const imageBlob = new Blob([imageInput.buffer], { type: imageInput.mimetype || "image/jpeg" });
      formData.append("images", imageBlob, imageInput.originalname || "planta.jpg");
      formData.append("organs", "auto");

      response = await fetch(url, {
        method: "POST",
        body: formData,
      });
    } else {
      throw new Error("Formato de imagen invalido");
    }

    if (!response.ok) {
      if (response.status === 404) {
        return {
          commonName: "Nombre comun desconocido",
          species: "Especie desconocida",
          family: "Familia desconocida",
          accuracy: 0,
          notFound: true
        };
      }
      throw new Error("Error with Pl@ntNet Species");
    }

    const data = await response.json();
    const bestResult = data.results?.[0];

    if (!bestResult) {
      return {
        commonName: "Nombre comun desconocido",
        species: "Especie desconocida",
        family: "Familia desconocida",
        accuracy: 0,
        notFound: true
      };
    }

    const accuracy = bestResult?.score ? Number((bestResult.score * 100).toFixed(1)) : 0;

    return {
      commonName: bestResult?.species?.commonNames?.[0] || "Nombre comun desconocido",
      species: bestResult?.species?.scientificNameWithoutAuthor || "Especie desconocida",
      family: bestResult?.species?.family?.scientificNameWithoutAuthor || "Familia desconocida",
      accuracy,
      notFound: accuracy === 0
    };
  } catch (error) {
    console.error("identifySpecies error:", error);
    return {
      commonName: "Nombre comun desconocido",
      species: "Especie desconocida",
      family: "Familia desconocida",
      accuracy: 0,
      notFound: true
    };
  }
}

// Detecta enfermedades en una imagen usando la API Pl@ntNet Diseases
export async function identifyDisease(imageInput) {
  try {
    let imageBlob;
    let filename = "planta.jpeg";

    // Si es una URL string, la descargamos primero a un Blob para reenviar
    if (typeof imageInput === "string") {
      const imageResponse = await fetch(imageInput);
      if (!imageResponse.ok) throw new Error("Could not download the test image to resend");
      imageBlob = await imageResponse.blob();
    // Si es un archivo binario subido (con buffer), creamos el Blob directamente
    } else if (imageInput && imageInput.buffer) {
      imageBlob = new Blob([imageInput.buffer], { type: imageInput.mimetype || "image/jpeg" });
      filename = imageInput.originalname || "planta.jpeg";
    } else {
      throw new Error("Formato de imagen invalido");
    }

    const url = `https://my-api.plantnet.org/v2/diseases/identify?include-related-images=true&no-reject=false&nb-results=10&lang=es&api-key=${PLANTNET_API_KEY}`;
    const formData = new FormData();

    formData.append("images", imageBlob, filename);
    formData.append("organs", "auto");

    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      if (response.status === 404) {
        return {
          diagnosis: "Sin enfermedad detectada",
          accuracy: 0,
          notFound: true
        };
      }
      throw new Error("Error with Pl@ntNet Diseases");
    }

    const data = await response.json();
    const bestDiagnosis = data.results?.[0];

    if (!bestDiagnosis) {
      return {
        diagnosis: "Sin enfermedad detectada",
        accuracy: 0,
        notFound: true
      };
    }

    const accuracy = bestDiagnosis?.score ? Number((bestDiagnosis.score * 100).toFixed(1)) : 0;

    return {
      diagnosis: bestDiagnosis?.description || bestDiagnosis?.disease?.name || "Sin enfermedad detectada",
      accuracy,
      notFound: accuracy === 0
    };
  } catch (error) {
    console.error("identifyDisease error:", error);
    return {
      diagnosis: "Sin enfermedad detectada",
      accuracy: 0,
      notFound: true
    };
  }
}
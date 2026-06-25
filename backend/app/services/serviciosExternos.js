// serviciosExternos.js
const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function identifySpecies(imageUrl) {
  try {
    const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&images=${encodeURIComponent(imageUrl)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error with Pl@ntNet Species");

    const data = await response.json();
    const bestResult = data.results?.[0];

    return {
      commonName: bestResult?.species?.commonNames?.[0] || "Unknown common name",
      species: bestResult?.species?.scientificNameWithoutAuthor || "Unknown species",
      family: bestResult?.species?.family?.scientificNameWithoutAuthor || "Unknown family",
      accuracy: bestResult?.score ? (bestResult.score * 100) : 0
    };
  } catch (error) {
    console.error(error);
  }
}

export async function identifyDisease(imageUrl) {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error("Could not download the test image to resend");
    const imageBlob = await imageResponse.blob();

    const url = `https://my-api.plantnet.org/v2/diseases/identify?include-related-images=true&no-reject=false&nb-results=10&lang=es&api-key=${PLANTNET_API_KEY}`;
    const formData = new FormData();

    formData.append("images", imageBlob, "planta.jpeg");
    formData.append("organs", "auto");

    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    if (!response.ok) throw new Error("Error with Pl@ntNet Diseases");

    const data = await response.json();
    const bestDiagnosis = data.results?.[0];

    return {
      diagnosis: bestDiagnosis?.description,
      accuracy: bestDiagnosis?.score ? (bestDiagnosis.score * 100) : 0
    };
  } catch (error) {
    console.error(error);
  }
}
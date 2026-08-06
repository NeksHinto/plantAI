const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Devuelve un tratamiento local por defecto según el diagnóstico
export function getLocalFallbackRecommendation(diagnosisText) {
  const diag = (diagnosisText || "").toLowerCase();
  
  if (diag.includes("no disease") || diag.includes("healthy") || diag.includes("sin enfermedad")) {
    return "No se detectaron enfermedades. Mantener los cuidados y riegos regulares de la planta.";
  }
  if (diag.includes("aphis") || diag.includes("pulgón") || diag.includes("insect")) {
    return "Presencia de Pulgones/Áfidos. Tratamiento: Pulverizar las hojas con jabón potásico y aceite de neem. Remover mecánicamente los brotes muy afectados.";
  }
  if (diag.includes("mildew") || diag.includes("oídio") || diag.includes("fungus") || diag.includes("rust")) {
    return "Infección por hongos (Oídio/Mildiu). Tratamiento: Reducir la humedad foliar (no mojar las hojas al regar) y aplicar un fungicida orgánico a base de azufre o cobre.";
  }
  if (diag.includes("rot") || diag.includes("pudrición")) {
    return "Pudrición de raíces o tallos. Tratamiento: Suspender el riego de inmediato. Permitir que el sustrato se seque por completo y evaluar el trasplante a tierra seca.";
  }
  if (diag.includes("spot") || diag.includes("mancha")) {
    return "Manchas foliares (bacteriosis o virosis). Tratamiento: Podar y desechar las hojas infectadas para evitar propagación. Desinfectar las herramientas de poda.";
  }
  
  // Tratamiento por defecto para otras enfermedades
  return "Enfermedad detectada. Recomendación: Aislar la planta para prevenir contagios en el mismo ambiente, moderar el riego y aplicar un fertilizante foliar para fortalecer sus defensas.";
}

// Genera una recomendación de tratamiento personalizada usando Gemini IA
export async function generateTreatmentNotes({ species, diagnosis, accuracy, temperature, isIndoors }) {
  if (!GEMINI_API_KEY) {
    return getLocalFallbackRecommendation(diagnosis);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `Analiza los siguientes datos de una planta y genera una recomendación muy concisa y de tono neutro (sin presentarte, sin saludos, ni sonar como un asistente de IA):
- Especie: ${species}
- Ubicación: ${isIndoors ? 'Interior' : 'Exterior'}
- Temperatura: ${temperature || 'Desconocida'}
- Diagnóstico: ${diagnosis} (Certeza: ${accuracy}%)

Escribe la respuesta en una o dos líneas breves siguiendo este formato exacto de ejemplo:
"Cuidado/Tratamiento: [Breve consejo sobre la enfermedad o cuidado]. Ambiente: [Evaluación rápida de si la temperatura de ${temperature} y su ubicación son adecuadas]."`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) throw new Error(`Gemini API returned status ${response.status}`);

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getLocalFallbackRecommendation(diagnosis);
  } catch (error) {
    console.error("Error llamando a Gemini, usando fallback local:", error);
    return getLocalFallbackRecommendation(diagnosis);
  }
}

const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function identificarPlanta(imageUrl) {
  if (!PLANTNET_API_KEY) console.warn("missing PLANTNET_API_KEY");
  // WIP
  return { especie: "Monstera Deliciosa"};
}

export async function diagnosticarSalud(imageUrl) {
  if (!GEMINI_API_KEY) console.warn("missing GEMINI_API_KEY");
  // wWIP
  return { estado: "Saludable", detalles: "Hojas firmes y buen color." };
}
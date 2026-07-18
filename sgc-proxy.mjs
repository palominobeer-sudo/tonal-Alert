// netlify/functions/sgc-proxy.mjs
// El navegador de un celular NO puede consultar directo al servidor del SGC (lo bloquea
// por seguridad, algo llamado CORS). Pero un servidor SÍ puede preguntarle a otro
// servidor sin ese bloqueo -- por eso esta función existe: la app le pregunta a ESTA
// función (mismo dominio, sin bloqueo), y esta función es la que de verdad consulta al
// SGC y le devuelve la respuesta a la app.
export default async () => {
  const url =
    "https://geoportal.sgc.gov.co/arcgis/rest/services/catalogo_sismos/catalogo_de_sismos_2/FeatureServer/0/query" +
    "?where=1%3D1&outFields=ESP_MAGNITUD,ESP_LATITUD,ESP_LONGITUD,ESP_PROFUNDIDAD,ESP_FECHA" +
    "&orderByFields=ESP_FECHA+DESC&resultRecordCount=300&f=geojson";

  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await r.text();
    if (!r.ok) {
      return new Response(JSON.stringify({ error: "SGC respondió " + r.status, body: text.slice(0, 300) }), {
        status: 502,
        headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
    // Reenviamos tal cual el GeoJSON del SGC, agregando el permiso para que el
    // navegador SÍ pueda leer esta respuesta (porque viene de nuestro propio dominio).
    return new Response(text, {
      status: 200,
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "no se pudo contactar al SGC: " + e.message }), {
      status: 502,
      headers: { "content-type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
};

export const config = { path: "/api/sgc" };

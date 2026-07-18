# Notificaciones push reales — guía de instalación

Esto SÍ cambia cómo publicas la app. Ya no es arrastrar la carpeta a Netlify Drop — ahora
necesitas conectar Netlify a una cuenta de GitHub. Es un paso de configuración que solo
haces UNA vez; después de eso, actualizar la app vuelve a ser simple.

Te explico primero qué es cada cosa, y luego los pasos exactos.

## Qué archivos son nuevos y por qué

- `netlify.toml` — le dice a Netlify dónde están las funciones.
- `netlify/functions/subscribe.mjs` — guarda el "buzón" de cada teléfono que activa alertas.
- `netlify/functions/check-quakes.mjs` — se ejecuta SOLA cada 5 minutos, revisa USGS y el
  SGC, y le manda una notificación real (pantalla bloqueada, app cerrada) a cada teléfono
  suscrito, si hay un sismo grande en el mundo o uno sentible en Colombia.
- `netlify/functions/unsubscribe.mjs` — para cuando alguien quiera desactivar las alertas.
- `netlify/functions/sgc-proxy.mjs` — **nueva**: resuelve el problema de "SGC sin conexión". El gobierno de Colombia bloquea que un navegador le pregunte directo (CORS); esta función le pregunta de servidor a servidor y le pasa la respuesta a tu app. Sin este paso desplegado, el mapa seguirá sin mostrar los sismos de Colombia.
- `package.json` — le dice a Netlify qué librerías instalar para que las funciones corran.

Probé toda la lógica de fechas, umbrales y el armado de las notificaciones con datos
simulados, y corre sin errores. Lo único que **no puedo probar yo mismo** desde aquí es el
envío real a través de un teléfono de verdad — eso solo se confirma una vez publicado.

## Paso 1 — Crea una cuenta de GitHub (si no tienes una)

Ve a github.com → Sign up. Es gratis.

## Paso 2 — Crea un repositorio nuevo

1. En GitHub, botón verde "New" (o el "+" arriba a la derecha → "New repository")
2. Nómbralo, por ejemplo, `tonal-alert`
3. Déjalo en **Public** o **Private**, cualquiera funciona
4. Click "Create repository"

## Paso 3 — Sube todos los archivos

En la página del repositorio recién creado, click en "uploading an existing file" (o
"Add file" → "Upload files"). Arrastra **todos** los archivos y carpetas que te acabo de
entregar — incluida la carpeta `netlify` completa con sus dos archivos adentro. GitHub
sube carpetas igual que archivos sueltos, solo arrástralos todos juntos.

Confirma el "commit" (botón verde abajo).

## Paso 4 — Conecta ese repositorio a Netlify

1. Entra a app.netlify.com
2. "Add new site" → "Import an existing project"
3. Elige GitHub, autoriza el acceso, selecciona el repositorio `tonal-alert`
4. Deja las opciones de build como están (no necesita comando de build) → "Deploy"

Netlify va a instalar las librerías y desplegar tanto la app como las funciones
automáticamente. Esto puede tardar 1-2 minutos la primera vez.

## Paso 5 — Configura las llaves VAPID (el paso que no puedes saltarte)

Estas llaves son las que permiten que SOLO tu servidor pueda enviar notificaciones a tus
usuarios (nadie más puede enviarlas en tu nombre). Ya las generé por ti:

En Netlify: tu sitio → "Site configuration" → "Environment variables" → "Add a variable" →
"Add a single variable", y agrega estas dos, una por una:

```
Nombre: VAPID_PUBLIC_KEY
Valor:  BN6k2rmqMkrZroLsio6VS8OPWfN96iiX_4SbFd3_60U9XBAhFDA-in8MQSY6IvNSYWiWcIT_8wRb_FLbLpWVTLU

Nombre: VAPID_PRIVATE_KEY
Valor:  I57aULznjtYntVrA_8Jjyk8Sscc8eoqPVlWTyWz2kaQ
```

⚠️ La llave PRIVADA nunca debe estar en el código ni compartirse — por eso va aquí, como
variable de entorno, y no en ningún archivo. Si algún día sospechas que se filtró, dímelo
y generamos un par nuevo.

Después de agregarlas, ve a "Deploys" → "Trigger deploy" → "Deploy site" para que las
funciones tomen las llaves nuevas.

## Paso 6 — Prueba que funcione

1. Abre tu sitio nuevo de Netlify en el teléfono
2. Debería aparecer un banner verde: "🔔 Activa alertas aunque tengas la app cerrada" →
   tócalo, acepta el permiso de notificaciones
3. En Netlify: "Logs" → "Functions" → deberías ver `check-quakes` ejecutándose cada 5
   minutos con un resultado como `{"checked":X,"fresh":Y,"notified":Z}`

Si `notified` da 0 casi siempre, es normal — solo avisa para sismos grandes en el mundo o
sentibles en Colombia, no para cada microsismo.

## De ahora en adelante, ¿cómo actualizamos la app?

Cuando yo te dé archivos nuevos: en vez de Netlify Drop, los subes al mismo repositorio de
GitHub (Paso 3, pero eligiendo "reemplazar" cuando ya exista el archivo). Netlify detecta
el cambio y redespliega solo. Te guío cada vez que lleguemos a ese paso.

## Honestidad sobre esta parte

Todo lo anterior en esta conversación (el HTML, los colores, el mapa, el GPS) lo pude
probar yo mismo de principio a fin antes de dártelo. Esta parte de notificaciones push
tiene piezas — el envío real a través de Google/Apple, el guardado en Netlify Blobs — que
solo existen una vez publicadas de verdad; no las puedo simular por completo desde acá.
Probé todo lo que sí se puede probar sin publicar (la lógica de fechas, umbrales, el
formado de las llamadas). Si algo no funciona al primer intento, dime exactamente qué
pasó (o pégame lo que digan los "Logs" de Netlify) y lo corregimos — es información nueva
que no tenía forma de anticipar sin verlo corriendo de verdad.

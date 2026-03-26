import { Link } from "react-router-dom";

const flow = [
  "El usuario envia credenciales desde el frontend.",
  "Better Auth valida credenciales en el backend.",
  "El servidor crea una sesion y responde con cookies.",
  "El navegador reenvia la cookie en las siguientes peticiones.",
  "El backend verifica la sesion antes de entregar recursos protegidos.",
];

export function HomePage() {
  return (
    <section className="stack-lg">
      <div className="card">
        <h2>Que debe observar el grupo durante la demo</h2>
        <ul className="list">
          <li>HTTP no recuerda al usuario por si solo.</li>
          <li>Autenticacion y autorizacion son problemas distintos.</li>
          <li>La cookie HttpOnly mantiene la sesion fuera de JavaScript.</li>
          <li>CORS y credentials importan porque cliente y servidor corren en puertos distintos.</li>
          <li>La ruta protegida responde distinto segun exista o no una sesion valida.</li>
        </ul>
      </div>

      <div className="grid">
        <article className="card">
          <h2>Anatomia de una peticion protegida</h2>
          <ol className="list ordered">
            {flow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>

        <article className="card accent">
          <h2>Recorrido sugerido</h2>
          <p>
            Primero crea una cuenta, luego entra al dashboard y finalmente abre
            las herramientas del navegador para explicar las cookies, las
            cabeceras CORS y la peticion a <code>/api/private/report</code>.
          </p>
          <Link className="button-link" to="/auth">
            Ir a la practica
          </Link>
        </article>
      </div>
    </section>
  );
}

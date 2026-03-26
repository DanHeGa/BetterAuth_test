import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";

type Feedback = {
  type: "success" | "error";
  message: string;
};

const initialSignUp = {
  name: "",
  email: "",
  password: "",
};

const initialSignIn = {
  email: "",
  password: "",
};

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from ?? "/dashboard";
  }, [location.state]);
  const { data: session } = authClient.useSession();
  const [signUpForm, setSignUpForm] = useState(initialSignUp);
  const [signInForm, setSignInForm] = useState(initialSignIn);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSigningUp(true);

    const { error } = await authClient.signUp.email({
      name: signUpForm.name,
      email: signUpForm.email,
      password: signUpForm.password,
      callbackURL: redirectTo,
    });

    setIsSigningUp(false);

    if (error) {
      setFeedback({
        type: "error",
        message: error.message ?? "No se pudo crear la cuenta.",
      });
      return;
    }

    setFeedback({
      type: "success",
      message: "Cuenta creada. Better Auth inicio sesion automaticamente.",
    });
    setSignUpForm(initialSignUp);
    navigate(redirectTo);
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setIsSigningIn(true);

    const { error } = await authClient.signIn.email({
      email: signInForm.email,
      password: signInForm.password,
      callbackURL: redirectTo,
      rememberMe: true,
    });

    setIsSigningIn(false);

    if (error) {
      setFeedback({
        type: "error",
        message: error.message ?? "No se pudo iniciar sesion.",
      });
      return;
    }

    setFeedback({
      type: "success",
      message: "Login correcto. Ya puedes visitar la ruta protegida.",
    });
    setSignInForm(initialSignIn);
    navigate(redirectTo);
  }

  return (
    <section className="stack-lg">
      <div className="card">
        <h2>Area de autenticacion</h2>
        <p>
          Este formulario consume los endpoints expuestos por Better Auth desde
          el backend en <code>http://localhost:3000/api/auth</code>.
        </p>
        {session ? (
          <p className="notice success">
            Ya existe una sesion activa para <strong>{session.user.email}</strong>.
          </p>
        ) : null}
        {feedback ? (
          <p className={`notice ${feedback.type}`}>{feedback.message}</p>
        ) : null}
      </div>

      <div className="grid">
        <form className="card form-card" onSubmit={handleSignUp}>
          <h3>Registro</h3>
          <label>
            Nombre
            <input
              required
              value={signUpForm.name}
              onChange={(event) =>
                setSignUpForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Correo
            <input
              required
              type="email"
              value={signUpForm.email}
              onChange={(event) =>
                setSignUpForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Contrasena
            <input
              required
              minLength={8}
              type="password"
              value={signUpForm.password}
              onChange={(event) =>
                setSignUpForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </label>
          <button disabled={isSigningUp} type="submit">
            {isSigningUp ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <form className="card form-card" onSubmit={handleSignIn}>
          <h3>Login</h3>
          <label>
            Correo
            <input
              required
              type="email"
              value={signInForm.email}
              onChange={(event) =>
                setSignInForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Contrasena
            <input
              required
              type="password"
              value={signInForm.password}
              onChange={(event) =>
                setSignInForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
            />
          </label>
          <button disabled={isSigningIn} type="submit">
            {isSigningIn ? "Entrando..." : "Iniciar sesion"}
          </button>
        </form>
      </div>
    </section>
  );
}

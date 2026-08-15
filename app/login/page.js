"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(event) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("E-mail ou senha inválidos.");
      setCarregando(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <h1 style={styles.logo}>
            POWER <span style={styles.orange}>ASSIST</span>
          </h1>
          <p style={styles.subtitle}>ASSISTÊNCIA 24H</p>
        </div>

        <h2 style={styles.title}>Acesso ao sistema</h2>

        <p style={styles.description}>
          Entre com seu e-mail e senha para continuar.
        </p>

        <form onSubmit={entrar} style={styles.form}>
          <label style={styles.label}>E-mail</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@empresa.com.br"
            required
            style={styles.input}
          />

          <label style={styles.label}>Senha</label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            required
            style={styles.input}
          />

          {erro && <p style={styles.error}>{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            style={styles.button}
          >
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>

        <p style={styles.footer}>
          Power Assist 24h • Sistema de Operações
        </p>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "40px",
    borderRadius: "14px",
    boxSizing: "border-box",
  },

  brand: {
    textAlign: "center",
    marginBottom: "35px",
  },

  logo: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "800",
    color: "#111111",
  },

  orange: {
    color: "#ff6a00",
  },

  subtitle: {
    marginTop: "6px",
    fontSize: "11px",
    letterSpacing: "3px",
    color: "#777777",
  },

  title: {
    marginBottom: "7px",
    fontSize: "22px",
  },

  description: {
    color: "#777777",
    fontSize: "14px",
    marginBottom: "28px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "7px",
  },

  input: {
    padding: "13px",
    border: "1px solid #dddddd",
    borderRadius: "7px",
    marginBottom: "18px",
    fontSize: "14px",
  },

  button: {
    background: "#ff6a00",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    padding: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "5px",
  },

  error: {
    background: "#fff0f0",
    color: "#b42318",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
  },

  footer: {
    textAlign: "center",
    color: "#999999",
    fontSize: "11px",
    marginTop: "30px",
  },
};

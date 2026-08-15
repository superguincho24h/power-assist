"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function RedefinirSenha() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [sessaoValida, setSessaoValida] = useState(false);

  useEffect(() => {
    async function prepararRecuperacao() {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);

        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          setSessaoValida(true);

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSessaoValida(true);
        } else {
          setErro(
            "O link de recuperação é inválido ou expirou. Solicite um novo link."
          );
        }
      } catch (error) {
        console.error("Erro ao validar recuperação:", error);

        setErro(
          "Não foi possível validar o link de recuperação. Solicite um novo link."
        );
      } finally {
        setVerificando(false);
      }
    }

    prepararRecuperacao();
  }, [supabase]);

  async function salvarNovaSenha(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!sessaoValida) {
      setErro(
        "A sessão de recuperação não é válida. Solicite um novo link."
      );
      return;
    }

    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        throw error;
      }

      setSucesso("Senha alterada com sucesso.");

      setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);

      setErro(
        error?.message ||
          "Não foi possível redefinir a senha. Solicite um novo link."
      );
    } finally {
      setCarregando(false);
    }
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

        <h2 style={styles.title}>Redefinir senha</h2>

        <p style={styles.description}>
          Cadastre uma nova senha para acessar o sistema.
        </p>

        {verificando ? (
          <div style={styles.info}>
            Validando link de recuperação...
          </div>
        ) : (
          <form onSubmit={salvarNovaSenha} style={styles.form}>
            <label style={styles.label}>Nova senha</label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a nova senha"
              required
              disabled={!sessaoValida}
              style={styles.input}
            />

            <label style={styles.label}>Confirmar nova senha</label>

            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite novamente a nova senha"
              required
              disabled={!sessaoValida}
              style={styles.input}
            />

            {erro && <p style={styles.error}>{erro}</p>}
            {sucesso && <p style={styles.success}>{sucesso}</p>}

            <button
              type="submit"
              disabled={carregando || !sessaoValida}
              style={{
                ...styles.button,
                opacity: carregando || !sessaoValida ? 0.6 : 1,
              }}
            >
              {carregando ? "SALVANDO..." : "SALVAR NOVA SENHA"}
            </button>
          </form>
        )}

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

  info: {
    background: "#f2f4f7",
    color: "#475467",
    padding: "12px",
    borderRadius: "7px",
    fontSize: "13px",
  },

  error: {
    background: "#fff0f0",
    color: "#b42318",
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
  },

  success: {
    background: "#ecfdf3",
    color: "#027a48",
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

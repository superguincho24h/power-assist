"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function Home() {
  const supabase = useMemo(() => createClient(), []);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [abertos, setAbertos] = useState(0);
  const [emAtendimento, setEmAtendimento] = useState(0);
  const [finalizadosHoje, setFinalizadosHoje] = useState(0);
  const [prestadoresAtivos, setPrestadoresAtivos] = useState(0);
  const [acionamentos, setAcionamentos] = useState([]);

  useEffect(() => {
    carregarPainel();
  }, []);

  async function carregarPainel() {
    setCarregando(true);
    setErro("");

    try {
      const inicioHoje = new Date();
      inicioHoje.setHours(0, 0, 0, 0);

      const [
        abertosResult,
        atendimentoResult,
        finalizadosResult,
        prestadoresResult,
        recentesResult,
      ] = await Promise.all([
        supabase
          .from("acionamentos")
          .select("*", { count: "exact", head: true })
          .eq("status", "ABERTO"),

        supabase
          .from("acionamentos")
          .select("*", { count: "exact", head: true })
          .in("status", [
            "PRESTADOR_ACIONADO",
            "ACEITO",
            "EM_DESLOCAMENTO",
            "NO_LOCAL",
            "EM_REMOCAO",
          ]),

        supabase
          .from("acionamentos")
          .select("*", { count: "exact", head: true })
          .eq("status", "FINALIZADO")
          .gte("created_at", inicioHoje.toISOString()),

        supabase
          .from("prestadores")
          .select("*", { count: "exact", head: true })
          .eq("status", "ATIVO"),

        supabase
          .from("acionamentos")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const resultados = [
        abertosResult,
        atendimentoResult,
        finalizadosResult,
        prestadoresResult,
        recentesResult,
      ];

      const resultadoComErro = resultados.find((resultado) => resultado.error);

      if (resultadoComErro) {
        throw resultadoComErro.error;
      }

      setAbertos(abertosResult.count || 0);
      setEmAtendimento(atendimentoResult.count || 0);
      setFinalizadosHoje(finalizadosResult.count || 0);
      setPrestadoresAtivos(prestadoresResult.count || 0);
      setAcionamentos(recentesResult.data || []);
    } catch (error) {
      console.error(error);
      setErro(error?.message || "Não foi possível carregar o painel.");
    } finally {
      setCarregando(false);
    }
  }

  function formatarStatus(status) {
    const nomes = {
      ABERTO: "Em aberto",
      PRESTADOR_ACIONADO: "Prestador acionado",
      ACEITO: "Aceito",
      EM_DESLOCAMENTO: "Em deslocamento",
      NO_LOCAL: "No local",
      EM_REMOCAO: "Em remoção",
      FINALIZADO: "Finalizado",
      CANCELADO: "Cancelado",
    };

    return nomes[status] || status || "-";
  }

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <h1 style={styles.logo}>
            POWER <span style={styles.orange}>ASSIST</span>
          </h1>

          <p style={styles.logoSubtitle}>ASSISTÊNCIA 24H</p>
        </div>

        <nav style={styles.menu}>
          <a href="/" style={styles.active}>
            ▣ Painel
          </a>

          <a href="/novo-acionamento" style={styles.item}>
            ＋ Novo acionamento
          </a>

          <a href="/acionamentos" style={styles.item}>
            ◉ Acionamentos
          </a>

          <a href="/clientes" style={styles.item}>
            ♟ Clientes
          </a>

          <a href="/veiculos" style={styles.item}>
            🚗 Veículos
          </a>

          <a href="/prestadores" style={styles.item}>
            🚚 Prestadores
          </a>

          <a href="/financeiro" style={styles.item}>
            ▤ Financeiro
          </a>
        </nav>

        <div style={styles.user}>
          <strong>Administrador</strong>
          <small>Power Assist 24h</small>
        </div>
      </aside>

      <section style={styles.content}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>Painel de Operações</h2>

            <p style={styles.subtitle}>
              Gerenciamento de assistência e acionamentos 24 horas
            </p>
          </div>

          <a href="/novo-acionamento" style={styles.newButton}>
            + NOVO ACIONAMENTO
          </a>
        </header>

        {erro && <div style={styles.error}>{erro}</div>}

        <div style={styles.cards}>
          <div style={styles.card}>
            <span style={styles.cardLabel}>EM ABERTO</span>
            <strong style={styles.cardNumber}>
              {carregando ? "..." : abertos}
            </strong>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>EM ATENDIMENTO</span>
            <strong style={styles.cardNumber}>
              {carregando ? "..." : emAtendimento}
            </strong>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>FINALIZADOS HOJE</span>
            <strong style={styles.cardNumber}>
              {carregando ? "..." : finalizadosHoje}
            </strong>
          </div>

          <div style={styles.card}>
            <span style={styles.cardLabel}>PRESTADORES ATIVOS</span>
            <strong style={styles.cardNumber}>
              {carregando ? "..." : prestadoresAtivos}
            </strong>
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Acionamentos recentes</h3>

            <a href="/acionamentos" style={styles.link}>
              Ver todos
            </a>
          </div>

          {carregando ? (
            <div style={styles.empty}>
              <p>Carregando acionamentos...</p>
            </div>
          ) : acionamentos.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.truck}>🚚</div>

              <h3>Nenhum acionamento registrado</h3>

              <p>
                Os novos protocolos aparecerão aqui assim que forem cadastrados.
              </p>

              <a href="/novo-acionamento" style={styles.createButton}>
                + CRIAR PRIMEIRO ACIONAMENTO
              </a>
            </div>
          ) : (
            <div style={styles.list}>
              {acionamentos.map((acionamento) => (
                <div key={acionamento.id} style={styles.row}>
                  <div>
                    <strong style={styles.protocol}>
                      {acionamento.protocolo}
                    </strong>

                    <div style={styles.route}>
                      {acionamento.origem || "Origem não informada"}
                      {acionamento.destino
                        ? ` → ${acionamento.destino}`
                        : ""}
                    </div>
                  </div>

                  <div style={styles.status}>
                    {formatarStatus(acionamento.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#f4f5f7",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111111",
  },

  sidebar: {
    width: "240px",
    minHeight: "100vh",
    background: "#111111",
    color: "#ffffff",
    padding: "35px 18px 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },

  logo: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "800",
  },

  orange: {
    color: "#ff6500",
  },

  logoSubtitle: {
    marginTop: "5px",
    fontSize: "11px",
    letterSpacing: "3px",
    color: "#dddddd",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "95px",
    flex: 1,
  },

  active: {
    display: "block",
    background: "#ff6500",
    color: "#ffffff",
    textDecoration: "none",
    padding: "14px",
    borderRadius: "7px",
    fontWeight: "bold",
  },

  item: {
    display: "block",
    color: "#ffffff",
    textDecoration: "none",
    padding: "14px",
    borderRadius: "7px",
  },

  user: {
    borderTop: "1px solid #333333",
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  content: {
    flex: 1,
    padding: "38px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "38px",
  },

  title: {
    fontSize: "30px",
    margin: 0,
  },

  subtitle: {
    color: "#777777",
    marginTop: "6px",
  },

  newButton: {
    background: "#ff6500",
    color: "#ffffff",
    padding: "14px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "25px",
  },

  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  cardLabel: {
    fontSize: "12px",
    color: "#666666",
  },

  cardNumber: {
    fontSize: "32px",
  },

  panel: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "25px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.06)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "20px",
    borderBottom: "1px solid #eeeeee",
  },

  panelTitle: {
    fontSize: "20px",
    margin: 0,
  },

  link: {
    color: "#ff6500",
    textDecoration: "none",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    padding: "70px 20px",
    color: "#666666",
  },

  truck: {
    fontSize: "38px",
  },

  createButton: {
    display: "inline-block",
    marginTop: "15px",
    background: "#ff6500",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "7px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  list: {
    display: "flex",
    flexDirection: "column",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 5px",
    borderBottom: "1px solid #eeeeee",
    gap: "20px",
  },

  protocol: {
    fontSize: "15px",
  },

  route: {
    marginTop: "6px",
    color: "#777777",
    fontSize: "13px",
  },

  status: {
    background: "#fff3e8",
    color: "#d95400",
    padding: "7px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },

  error: {
    background: "#fff0f0",
    color: "#b42318",
    padding: "12px",
    borderRadius: "7px",
    marginBottom: "20px",
  },
};

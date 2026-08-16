"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AcionamentosPage() {
  const supabase = useMemo(() => createClient(), []);

  const [acionamentos, setAcionamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  useEffect(() => {
    carregarAcionamentos();
  }, []);

  async function carregarAcionamentos() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("acionamentos")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error("Erro ao carregar acionamentos:", error);
      setErro(error.message || "Não foi possível carregar os acionamentos.");
      setCarregando(false);
      return;
    }

    setAcionamentos(data || []);
    setCarregando(false);
  }

  function formatarData(data) {
    if (!data) return "-";

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));
  }

  function formatarMoeda(valor) {
    const numero = Number(valor || 0);

    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarStatus(status) {
    if (!status) return "Em aberto";

    const mapa = {
      ABERTO: "Em aberto",
      EM_ABERTO: "Em aberto",
      EM_ATENDIMENTO: "Em atendimento",
      FINALIZADO: "Finalizado",
      CANCELADO: "Cancelado",
    };

    return mapa[status] || status.replaceAll("_", " ");
  }

  const listaFiltrada = acionamentos.filter((item) => {
    const termo = busca.trim().toLowerCase();

    const correspondeBusca =
      !termo ||
      item.protocolo?.toLowerCase().includes(termo) ||
      item.solicitante?.toLowerCase().includes(termo) ||
      item.telefone_solicitante?.toLowerCase().includes(termo) ||
      item.origem?.toLowerCase().includes(termo) ||
      item.destino?.toLowerCase().includes(termo);

    const correspondeStatus =
      statusFiltro === "TODOS" || item.status === statusFiltro;

    return correspondeBusca && correspondeStatus;
  });

  return (
    <main style={styles.page}>
      <aside style={styles.sidebar}>
        <div>
          <h1 style={styles.logo}>
            POWER <span style={styles.orange}>ASSIST</span>
          </h1>
          <p style={styles.subtitle}>ASSISTÊNCIA 24H</p>
        </div>

        <nav style={styles.menu}>
          <a href="/" style={styles.item}>
            ▣ Painel
          </a>

          <a href="/novo-acionamento" style={styles.item}>
            ＋ Novo acionamento
          </a>

          <a href="/acionamentos" style={styles.active}>
            ◉ Acionamentos
          </a>

          <div style={styles.item}>♟ Clientes</div>
          <div style={styles.item}>🚙 Veículos</div>
          <div style={styles.item}>🚚 Prestadores</div>
          <div style={styles.item}>▤ Financeiro</div>
        </nav>

        <div style={styles.usuario}>
          <strong>Administrador</strong>
          <span>Power Assist 24h</span>
        </div>
      </aside>

      <section style={styles.content}>
        <div style={styles.topo}>
          <div>
            <h2 style={styles.titulo}>Acionamentos</h2>
            <p style={styles.descricao}>
              Consulte e acompanhe os atendimentos registrados.
            </p>
          </div>

          <a href="/novo-acionamento" style={styles.botaoNovo}>
            + NOVO ACIONAMENTO
          </a>
        </div>

        {erro && <div style={styles.erro}>{erro}</div>}

        <div style={styles.filtros}>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar protocolo, solicitante, origem ou destino..."
            style={styles.input}
          />

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={styles.select}
          >
            <option value="TODOS">Todos os status</option>
            <option value="ABERTO">Em aberto</option>
            <option value="EM_ATENDIMENTO">Em atendimento</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>

          <button onClick={carregarAcionamentos} style={styles.atualizar}>
            Atualizar
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTopo}>
            <div>
              <h3 style={styles.cardTitulo}>Todos os acionamentos</h3>
              <span style={styles.quantidade}>
                {listaFiltrada.length} registro(s)
              </span>
            </div>
          </div>

          {carregando ? (
            <div style={styles.estado}>Carregando acionamentos...</div>
          ) : listaFiltrada.length === 0 ? (
            <div style={styles.estado}>
              <div style={styles.icone}>🚚</div>
              <strong>Nenhum acionamento encontrado</strong>
              <span style={styles.estadoTexto}>
                Os atendimentos cadastrados aparecerão aqui.
              </span>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Protocolo</th>
                    <th style={styles.th}>Data</th>
                    <th style={styles.th}>Solicitante</th>
                    <th style={styles.th}>Origem / Destino</th>
                    <th style={styles.th}>KM</th>
                    <th style={styles.th}>Prestador</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {listaFiltrada.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        <strong>{item.protocolo || "-"}</strong>
                      </td>

                      <td style={styles.td}>
                        {formatarData(item.criado_em)}
                      </td>

                      <td style={styles.td}>
                        <strong>{item.solicitante || "-"}</strong>
                        <div style={styles.secundario}>
                          {item.telefone_solicitante || ""}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.rota}>
                          <strong>Origem:</strong> {item.origem || "-"}
                        </div>
                        <div style={styles.rota}>
                          <strong>Destino:</strong> {item.destino || "-"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {item.km_realizado ?? item.km_estimado ?? 0} km
                      </td>

                      <td style={styles.td}>
                        {formatarMoeda(item.valor_prestador)}
                      </td>

                      <td style={styles.td}>
                        {formatarMoeda(item.valor_cliente)}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.status,
                            ...(item.status === "FINALIZADO"
                              ? styles.finalizado
                              : item.status === "EM_ATENDIMENTO"
                              ? styles.atendimento
                              : item.status === "CANCELADO"
                              ? styles.cancelado
                              : styles.aberto),
                          }}
                        >
                          {formatarStatus(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    color: "#111",
  },

  sidebar: {
    width: "230px",
    minHeight: "100vh",
    background: "#111",
    color: "#fff",
    padding: "30px 16px 20px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  logo: {
    margin: 0,
    fontSize: "25px",
    fontWeight: 800,
  },

  orange: {
    color: "#ff6500",
  },

  subtitle: {
    marginTop: "6px",
    fontSize: "11px",
    letterSpacing: "4px",
  },

  menu: {
    marginTop: "80px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  item: {
    display: "block",
    color: "#fff",
    textDecoration: "none",
    padding: "14px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  active: {
    display: "block",
    color: "#fff",
    textDecoration: "none",
    background: "#ff6500",
    padding: "14px 10px",
    borderRadius: "8px",
    fontWeight: 700,
  },

  usuario: {
    borderTop: "1px solid #333",
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    fontSize: "14px",
  },

  content: {
    flex: 1,
    padding: "34px 38px",
    minWidth: 0,
  },

  topo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
  },

  titulo: {
    margin: 0,
    fontSize: "32px",
  },

  descricao: {
    margin: "5px 0 0",
    color: "#666",
  },

  botaoNovo: {
    background: "#ff6500",
    color: "#fff",
    textDecoration: "none",
    padding: "15px 22px",
    borderRadius: "8px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  erro: {
    background: "#ffe9e9",
    color: "#d11a1a",
    padding: "14px",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  filtros: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  input: {
    flex: "1 1 380px",
    padding: "13px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#fff",
  },

  select: {
    minWidth: "190px",
    padding: "13px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
  },

  atualizar: {
    border: "1px solid #ddd",
    background: "#fff",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  cardTopo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  cardTitulo: {
    margin: "0 0 5px",
    fontSize: "20px",
  },

  quantidade: {
    color: "#777",
    fontSize: "13px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1050px",
  },

  th: {
    textAlign: "left",
    padding: "13px 10px",
    borderBottom: "1px solid #ddd",
    color: "#555",
    fontSize: "12px",
    textTransform: "uppercase",
  },

  td: {
    padding: "16px 10px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
    fontSize: "13px",
  },

  secundario: {
    color: "#777",
    marginTop: "5px",
  },

  rota: {
    marginBottom: "5px",
    maxWidth: "340px",
  },

  status: {
    display: "inline-block",
    padding: "7px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  aberto: {
    background: "#fff1e6",
    color: "#d95700",
  },

  atendimento: {
    background: "#e8f2ff",
    color: "#1769aa",
  },

  finalizado: {
    background: "#e8f7ed",
    color: "#237a3b",
  },

  cancelado: {
    background: "#ffe8e8",
    color: "#b42318",
  },

  estado: {
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "#555",
  },

  icone: {
    fontSize: "38px",
  },

  estadoTexto: {
    color: "#777",
  },
};

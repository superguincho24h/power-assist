export default function Home() {
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
          <div style={styles.active}>▣ Painel</div>
          <div style={styles.item}>＋ Novo acionamento</div>
          <div style={styles.item}>◉ Acionamentos</div>
          <div style={styles.item}>♙ Clientes</div>
          <div style={styles.item}>🚗 Veículos</div>
          <div style={styles.item}>🚚 Prestadores</div>
          <div style={styles.item}>▤ Financeiro</div>
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
            <p style={styles.description}>
              Gerenciamento de assistência e acionamentos 24 horas
            </p>
          </div>

          <button style={styles.button}>+ NOVO ACIONAMENTO</button>
        </header>

        <div style={styles.cards}>
          <Card titulo="EM ABERTO" valor="0" />
          <Card titulo="EM ATENDIMENTO" valor="0" />
          <Card titulo="FINALIZADOS HOJE" valor="0" />
          <Card titulo="PRESTADORES ATIVOS" valor="0" />
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3>Acionamentos recentes</h3>
            <span style={styles.link}>Ver todos</span>
          </div>

          <div style={styles.empty}>
            <div style={styles.truck}>🚚</div>
            <h3>Nenhum acionamento registrado</h3>
            <p>
              Os novos protocolos aparecerão aqui assim que forem cadastrados.
            </p>
            <button style={styles.button}>+ CRIAR PRIMEIRO ACIONAMENTO</button>
          </div>
        </section>
      </section>
    </main>
  );
}

function Card({ titulo, valor }) {
  return (
    <div style={styles.card}>
      <span style={styles.cardTitle}>{titulo}</span>
      <strong style={styles.number}>{valor}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    margin: 0,
    background: "#f5f6f8",
    color: "#171717",
    fontFamily: "Arial, sans-serif",
  },

  sidebar: {
    width: "245px",
    minHeight: "100vh",
    background: "#111111",
    color: "#ffffff",
    padding: "30px 22px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  logo: {
    margin: 0,
    fontSize: "23px",
    fontWeight: "800",
  },

  orange: {
    color: "#ff6a00",
  },

  subtitle: {
    marginTop: "5px",
    color: "#9d9d9d",
    fontSize: "11px",
    letterSpacing: "2px",
  },

  menu: {
    marginTop: "45px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  item: {
    padding: "13px 15px",
    borderRadius: "7px",
    color: "#d0d0d0",
    fontSize: "14px",
  },

  active: {
    padding: "13px 15px",
    borderRadius: "7px",
    background: "#ff6a00",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "bold",
  },

  user: {
    borderTop: "1px solid #333",
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  content: {
    flex: 1,
    padding: "38px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: "28px",
  },

  description: {
    color: "#777",
    marginTop: "7px",
  },

  button: {
    background: "#ff6a00",
    color: "#ffffff",
    border: 0,
    borderRadius: "7px",
    padding: "13px 18px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
    marginTop: "35px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "10px",
    padding: "22px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
  },

  cardTitle: {
    color: "#777",
    fontSize: "12px",
    fontWeight: "bold",
  },

  number: {
    marginTop: "10px",
    fontSize: "32px",
  },

  panel: {
    marginTop: "25px",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "25px",
    minHeight: "350px",
    boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eeeeee",
    paddingBottom: "15px",
  },

  link: {
    color: "#ff6a00",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    paddingTop: "65px",
    color: "#666666",
  },

  truck: {
    fontSize: "45px",
  },
};

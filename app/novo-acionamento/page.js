"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function NovoAcionamento() {
  const router = useRouter();
  const supabase = createClient();

  const [clientes, setClientes] = useState([]);
  const [prestadores, setPrestadores] = useState([]);
  const [servicos, setServicos] = useState([]);

  const [clienteNome, setClienteNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [veiculo, setVeiculo] = useState("");
  const [placa, setPlaca] = useState("");
  const [categoria, setCategoria] = useState("LEVE");
  const [servicoId, setServicoId] = useState("");
  const [prestadorId, setPrestadorId] = useState("");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [kmEstimado, setKmEstimado] = useState("");
  const [valorPrestador, setValorPrestador] = useState("");
  const [valorCliente, setValorCliente] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [
      { data: clientesData },
      { data: prestadoresData },
      { data: servicosData },
    ] = await Promise.all([
      supabase
        .from("clientes")
        .select("id,nome,telefone")
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("prestadores")
        .select("id,nome,nome_fantasia,cidade,estado")
        .eq("status", "ATIVO")
        .order("nome"),
      supabase
        .from("servicos")
        .select("id,nome")
        .eq("ativo", true)
        .order("nome"),
    ]);

    setClientes(clientesData || []);
    setPrestadores(prestadoresData || []);
    setServicos(servicosData || []);
  }

  const clienteExistente = useMemo(() => {
    const nome = clienteNome.trim().toLowerCase();

    if (!nome) return null;

    return clientes.find(
      (cliente) => cliente.nome?.trim().toLowerCase() === nome
    );
  }, [clienteNome, clientes]);

  function gerarProtocolo() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    const hora = String(agora.getHours()).padStart(2, "0");
    const minuto = String(agora.getMinutes()).padStart(2, "0");
    const segundo = String(agora.getSeconds()).padStart(2, "0");

    return `PA-${ano}${mes}${dia}-${hora}${minuto}${segundo}`;
  }

  async function salvarAcionamento(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    try {
      if (!clienteNome.trim()) {
        throw new Error("Informe o nome do cliente.");
      }

      if (!veiculo.trim()) {
        throw new Error("Informe o veículo.");
      }

      if (!origem.trim()) {
        throw new Error("Informe a origem.");
      }

      let clienteId = clienteExistente?.id || null;

      if (!clienteId) {
        const { data: novoCliente, error: clienteError } = await supabase
          .from("clientes")
          .insert({
            nome: clienteNome.trim(),
            telefone: telefone.trim() || null,
            ativo: true,
          })
          .select("id")
          .single();

        if (clienteError) throw clienteError;

        clienteId = novoCliente.id;
      } else if (telefone.trim()) {
        await supabase
          .from("clientes")
          .update({
            telefone: telefone.trim(),
          })
          .eq("id", clienteId);
      }

      let veiculoId = null;

      const placaNormalizada = placa.trim().toUpperCase();

      if (placaNormalizada) {
        const { data: veiculoExistente } = await supabase
          .from("veiculos")
          .select("id")
          .eq("placa", placaNormalizada)
          .maybeSingle();

        if (veiculoExistente?.id) {
          veiculoId = veiculoExistente.id;

          await supabase
            .from("veiculos")
            .update({
              cliente_id: clienteId,
              modelo: veiculo.trim(),
              categoria,
            })
            .eq("id", veiculoId);
        }
      }

      if (!veiculoId) {
        const { data: novoVeiculo, error: veiculoError } = await supabase
          .from("veiculos")
          .insert({
            cliente_id: clienteId,
            placa: placaNormalizada || null,
            modelo: veiculo.trim(),
            categoria,
          })
          .select("id")
          .single();

        if (veiculoError) throw veiculoError;

        veiculoId = novoVeiculo.id;
      }

      const protocolo = gerarProtocolo();

      const { error: acionamentoError } = await supabase
        .from("acionamentos")
        .insert({
          protocolo,
          cliente_id: clienteId,
          veiculo_id: veiculoId,
          prestador_id: prestadorId || null,
          servico_id: servicoId || null,
          telefone_solicitante: telefone.trim() || null,
          origem: origem.trim(),
          destino: destino.trim() || null,
          km_estimado: kmEstimado ? Number(kmEstimado) : null,
          valor_prestador: valorPrestador ? Number(valorPrestador) : 0,
          valor_cliente: valorCliente ? Number(valorCliente) : 0,
          status: prestadorId ? "PRESTADOR_ACIONADO" : "ABERTO",
          observacoes: observacoes.trim() || null,
        });

      if (acionamentoError) throw acionamentoError;

      setSucesso(`Acionamento ${protocolo} criado com sucesso.`);

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(error);
      setErro(error?.message || "Não foi possível salvar o acionamento.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Novo Acionamento</h1>
            <p style={styles.subtitle}>
              Cadastre uma nova solicitação de assistência 24h.
            </p>
          </div>

          <button style={styles.secondaryButton} onClick={() => router.push("/")}>
            Voltar ao painel
          </button>
        </div>

        <form onSubmit={salvarAcionamento} style={styles.card}>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Cliente</label>
              <input
                list="clientes-cadastrados"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Nome do cliente"
                required
                style={styles.input}
              />

              <datalist id="clientes-cadastrados">
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.nome}>
                    {cliente.telefone || ""}
                  </option>
                ))}
              </datalist>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Telefone</label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(31) 99999-9999"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Veículo</label>
              <input
                value={veiculo}
                onChange={(e) => setVeiculo(e.target.value)}
                placeholder="Ex.: Chevrolet Onix"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Placa</label>
              <input
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="ABC1D23"
                maxLength={10}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                style={styles.input}
              >
                <option value="MOTO">Moto</option>
                <option value="LEVE">Leve</option>
                <option value="UTILITARIO">Utilitário</option>
                <option value="PESADO">Pesado</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Serviço</label>
              <select
                value={servicoId}
                onChange={(e) => setServicoId(e.target.value)}
                style={styles.input}
              >
                <option value="">Selecione</option>

                {servicos.map((servico) => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Prestador</label>
              <select
                value={prestadorId}
                onChange={(e) => setPrestadorId(e.target.value)}
                style={styles.input}
              >
                <option value="">A definir</option>

                {prestadores.map((prestador) => (
                  <option key={prestador.id} value={prestador.id}>
                    {prestador.nome_fantasia || prestador.nome}
                    {prestador.cidade ? ` - ${prestador.cidade}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>KM estimado</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={kmEstimado}
                onChange={(e) => setKmEstimado(e.target.value)}
                placeholder="0"
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Origem</label>
              <input
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                placeholder="Endereço de origem"
                required
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Destino</label>
              <input
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Endereço de destino"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Valor do prestador</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valorPrestador}
                onChange={(e) => setValorPrestador(e.target.value)}
                placeholder="0,00"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Valor do cliente</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valorCliente}
                onChange={(e) => setValorCliente(e.target.value)}
                placeholder="0,00"
                style={styles.input}
              />
            </div>

            <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
              <label style={styles.label}>Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Informações adicionais do atendimento"
                style={styles.textarea}
              />
            </div>
          </div>

          {erro && <div style={styles.error}>{erro}</div>}
          {sucesso && <div style={styles.success}>{sucesso}</div>}

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => router.push("/")}
              style={styles.secondaryButton}
            >
              Cancelar
            </button>

            <button type="submit" disabled={salvando} style={styles.primaryButton}>
              {salvando ? "SALVANDO..." : "SALVAR ACIONAMENTO"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    color: "#171717",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "32px",
  },

  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "24px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
  },

  subtitle: {
    color: "#777777",
    marginTop: "7px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "7px",
  },

  input: {
    border: "1px solid #d7d7d7",
    borderRadius: "7px",
    padding: "12px",
    fontSize: "14px",
    background: "#ffffff",
  },

  textarea: {
    border: "1px solid #d7d7d7",
    borderRadius: "7px",
    padding: "12px",
    minHeight: "100px",
    resize: "vertical",
    fontFamily: "Arial, Helvetica, sans-serif",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop: "1px solid #eeeeee",
    marginTop: "25px",
    paddingTop: "20px",
  },

  primaryButton: {
    background: "#ff6a00",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    padding: "13px 18px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  secondaryButton: {
    background: "#ffffff",
    color: "#222222",
    border: "1px solid #d5d5d5",
    borderRadius: "7px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  error: {
    background: "#fff0f0",
    color: "#b42318",
    padding: "12px",
    borderRadius: "7px",
    marginTop: "20px",
  },

  success: {
    background: "#ecfdf3",
    color: "#027a48",
    padding: "12px",
    borderRadius: "7px",
    marginTop: "20px",
  },
};

import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:8080";

export default function SendSignal() {
  const [form, setForm] = useState({
    campeonato: "",
    nomeTimes: "",
    tempoPartida: "",
    placar: "",
    acaoSinal: "",
    tipoEvento: "DICA",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Validação simples
    if (
      !form.campeonato.trim() ||
      !form.nomeTimes.trim() ||
      !form.tempoPartida.trim() ||
      !form.placar.trim() ||
      !form.acaoSinal.trim() ||
      !form.tipoEvento.trim()
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/api/signals`,
        form, // envie cada um de cada vez ex: campeonate, nomeTimes, etc
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Sinal enviado com sucesso!");
      setForm({
        campeonato: "",
        nomeTimes: "",
        tempoPartida: "",
        placar: "",
        acaoSinal: "",
        tipoEvento: "DICA",
      });
    } catch (err) {
      setError("Erro ao enviar sinal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          minWidth: 340
        }}
      >
        <h2 style={{ marginBottom: 24, textAlign: "center" }}>Enviar Sinal</h2>
        <div style={{ marginBottom: 12 }}>
          <label>Campeonato</label>
          <input
            name="campeonato"
            value={form.campeonato}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Times</label>
          <input
            name="nomeTimes"
            value={form.nomeTimes}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Tempo de Partida</label>
          <input
            name="tempoPartida"
            value={form.tempoPartida}
            onChange={handleChange}
            required
            placeholder="Ex: 75'"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Placar</label>
          <input
            name="placar"
            value={form.placar}
            onChange={handleChange}
            required
            placeholder="Ex: 2x1"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Ação do Sinal</label>
          <input
            name="acaoSinal"
            value={form.acaoSinal}
            onChange={handleChange}
            required
            placeholder="Ex: Aposta: Vitória do Flamengo"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Tipo de Evento</label>
          <select
            name="tipoEvento"
            value={form.tipoEvento}
            onChange={handleChange}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            <option value="DICA">DICA</option>
            <option value="GOL">GOL</option>
            <option value="CARTAO">CARTAO</option>
            <option value="ALERTA">ALERTA</option>
            <option value="PRO">PRO</option>
          </select>
        </div>
        {success && <div style={{ color: "green", marginBottom: 12 }}>{success}</div>}
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Enviando..." : "Enviar Sinal"}
        </button>
      </form>
    </div>
  );
}
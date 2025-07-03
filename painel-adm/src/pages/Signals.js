import React, { useEffect, useState } from "react";
import { api } from "../config/api";

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSignals();
  }, []);

  async function fetchSignals() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/signals");
      setSignals(res.data || []);
    } catch {
      setError("Erro ao buscar sinais.");
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Sinais</h2>
      {loading && <div>Carregando...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <ul>
        {signals.map((signal, idx) => (
          <li key={idx}>
            <div><b>Campeonato:</b> {signal.campeonato}</div>
            <div><b>Times:</b> {signal.nomeTimes}</div>
            <div><b>Tempo:</b> {signal.tempoPartida}</div>
            <div><b>Placar:</b> {signal.placar}</div>
            <div><b>Ação:</b> {signal.acaoSinal}</div>
            <div><b>Tipo:</b> {signal.tipoEvento}</div>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
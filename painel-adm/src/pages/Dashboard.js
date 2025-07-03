import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../config/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    proUsers: 0,
    signals: 0,
    terms: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      let users = 0, proUsers = 0, signals = 0, terms = 0;
      try {
        const usersRes = await api.get("/api/users");
        users = Array.isArray(usersRes.data) ? usersRes.data.length : 0;
      } catch {}
      try {
        const proUsersRes = await api.get("/api/users/pro");
        proUsers = Array.isArray(proUsersRes.data) ? proUsersRes.data.length : 0;
      } catch {}
      try {
        const signalsRes = await api.get("/api/signals");
        signals = Array.isArray(signalsRes.data) ? signalsRes.data.length : 0;
      } catch {}
      try {
        const termsRes = await api.get("/api/terms");
        terms = Array.isArray(termsRes.data) ? termsRes.data.length : 0;
      } catch {}
      setStats({ users, proUsers, signals, terms });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cardStyle = {
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    padding: 24,
    minWidth: 180,
    margin: 12,
    flex: 1,
    textAlign: "center"
  };

  const linkStyle = {
    display: "inline-block",
    marginTop: 12,
    color: "#e53935",
    fontWeight: "bold",
    textDecoration: "none"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f5",
      padding: 32
    }}>
      <h1 style={{ marginBottom: 8 }}>Painel Administrativo</h1>
      <p style={{ marginBottom: 32 }}>Bem-vindo ao painel mestre do Chamagol!</p>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        marginBottom: 32,
        justifyContent: "flex-start"
      }}>
        <div style={cardStyle}>
          <h2>{loading ? "..." : stats.users}</h2>
          <div>Total de Usuários</div>
          <Link to="/usuarios" style={linkStyle}>Ver usuários</Link>
        </div>
        <div style={cardStyle}>
          <h2>{loading ? "..." : stats.proUsers}</h2>
          <div>Usuários PRO</div>
          <Link to="/usuarios-pro" style={linkStyle}>Ver usuários PRO</Link>
        </div>
        <div style={cardStyle}>
          <h2>{loading ? "..." : stats.signals}</h2>
          <div>Sinais enviados</div>
          <Link to="/sinais" style={linkStyle}>Ver sinais</Link>
        </div>
        <div style={cardStyle}>
          <h2>{loading ? "..." : stats.terms}</h2>
          <div>Termos de Uso</div>
          <Link to="/termos" style={linkStyle}>Ir para termos de uso</Link>
        </div>
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        marginBottom: 32,
        justifyContent: "flex-start"
      }}>
        <div style={{ ...cardStyle, minWidth: 220 }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Enviar Sinal</div>
          <Link to="/enviar-sinal" style={linkStyle}>Ir para envio de sinais</Link>
        </div>
        <div style={{ ...cardStyle, minWidth: 220 }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>Enviar Notificação</div>
          <a href="#" style={linkStyle}>Ir para notificações</a>
        </div>
      </div>
    </div>
  );
}
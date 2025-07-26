import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../config/api";
import "./css/Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    proUsers: 0,
    signals: 0,
    terms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    // Animação de entrada
    setTimeout(() => setIsAnimated(true), 100);
    
    async function fetchStats() {
      setLoading(true);
      let users = 0, proUsers = 0, signals = 0, terms = 0;
      
      try {
        const usersRes = await api.get("/api/users");
        users = Array.isArray(usersRes.data) ? usersRes.data.length : 0;
      } catch {}
      
      try {
        const proUsersRes = await api.get("/api/users/vip");
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

  const StatCard = ({ title, value, link, linkText, icon, color = "default" }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">
          {loading ? (
            <div className="stat-skeleton"></div>
          ) : (
            <span className="stat-number">{value}</span>
          )}
        </div>
        <div className="stat-title">{title}</div>
        <Link to={link} className="stat-link">
          {linkText}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );

  const ActionCard = ({ title, description, link, icon }) => (
    <div className="action-card">
      <div className="action-icon">
        {icon}
      </div>
      <div className="action-content">
        <h3 className="action-title">{title}</h3>
        <p className="action-description">{description}</p>
        <Link to={link} className="action-button">
          <span>Acessar</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  );

  return (
    <div className={`dashboard-container ${isAnimated ? 'animated' : ''}`}>
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Painel Administrativo</h1>
          <p className="dashboard-subtitle">Bem-vindo ao painel mestre do ChamaGol</p>
        </div>
        <div className="header-decoration">
          <div className="decoration-shape"></div>
          <div className="decoration-shape"></div>
          <div className="decoration-shape"></div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="stats-section">
          <h2 className="section-title">Estatísticas</h2>
          <div className="stats-grid">
            <StatCard
              title="Total de Usuários"
              value={stats.users}
              link="/usuarios"
              linkText="Ver usuários"
              color="users"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            
            <StatCard
              title="Usuários VIP"
              value={stats.proUsers}
              link="/usuarios-pro"
              linkText="Ver usuários VIP"
              color="pro"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            
            <StatCard
              title="Sinais Enviados"
              value={stats.signals}
              link="/sinais"
              linkText="Ver sinais"
              color="signals"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            
            <StatCard
              title="Termos de Uso"
              value={stats.terms}
              link="/termos"
              linkText="Gerenciar termos"
              color="terms"
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
          </div>
        </section>

        <section className="actions-section">
          <h2 className="section-title">Ações Rápidas</h2>
          <div className="actions-grid">
            <ActionCard
              title="Enviar Sinal"
              description="Envie sinais para os usuários do aplicativo"
              link="/enviar-sinal"
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 8l-5 5M8 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
            
            <ActionCard
              title="Enviar Notificação"
              description="Envie notificações push para os usuários"
              link="/notificacoes"
              icon={
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}
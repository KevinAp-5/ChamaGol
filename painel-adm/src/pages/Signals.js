import React, { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, Calendar, Users, Target, Clock, TrendingUp, AlertCircle, Zap, Trophy, Star } from "lucide-react";
import { api } from "../config/api";

const SignalCard = ({ signal, index }) => {
  const getEventColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'gol': return '#34C759';
      case 'cartão': return '#FF9500';
      case 'fim': return '#E53935';
      case 'vip': return '#8E24AA';
      default: return '#757575';
    }
  };

  const getEventIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'gol': return Target;
      case 'cartão': return AlertCircle;
      case 'fim': return Clock;
      case 'vip': return Star;
      default: return Zap;
    }
  };

  let dateString = "";
  if (signal.createdAt) {
    const date = new Date(signal.createdAt);
    dateString = isNaN(date.getTime()) ? "" : date.toLocaleString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (signal.id && !isNaN(signal.id)) {
    const date = new Date(Number(signal.id));
    dateString = isNaN(date.getTime()) ? "" : date.toLocaleString("pt-BR", {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    dateString = "";
  }

  const EventIcon = getEventIcon(signal.tipoEvento);

  return (
    <div 
      className="signal-card"
      style={{
        animationDelay: `${index * 0.1}s`
      }}
    >
      <div className="signal-card-border" style={{ background: getEventColor(signal.tipoEvento) }} />
      
      <div className="signal-header">
        <div className="signal-championship">
          <Trophy size={16} color="#E53935" />
          <span>{signal.campeonato}</span>
        </div>
        <div className="signal-time-badge">
          <Clock size={14} />
          <span>{signal.tempoPartida}</span>
        </div>
      </div>

      <div className="signal-match">
        <div className="match-info">
          <div className="teams-container">
            <Users size={20} color="#E53935" />
            <span className="teams">{signal.nomeTimes}</span>
          </div>
          <div className="score-container">
            <TrendingUp size={16} color="#757575" />
            <span className="score">{signal.placar}</span>
          </div>
        </div>
      </div>

      <div className="signal-action">
        <div className="event-badge" style={{ backgroundColor: getEventColor(signal.tipoEvento) }}>
          <EventIcon size={14} />
          <span>{signal.tipoEvento}</span>
        </div>
        <div className="action-description">
          <span>{signal.acaoSinal}</span>
        </div>
      </div>

      <div className="signal-footer">
        <div className="signal-date">
          <Calendar size={14} />
          <span>{dateString || "Data não disponível"}</span>
        </div>
      </div>
    </div>
  );
};

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchSignals();
  }, []);

  async function fetchSignals() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/signals");
      setSignals(res.data || []);
    } catch (err) {
      setError(err.message || "Erro ao buscar sinais.");
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSignals();
    setRefreshing(false);
  };

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.nomeTimes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.campeonato?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || signal.tipoEvento?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredSignals.length / itemsPerPage);
  const currentSignals = filteredSignals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const eventTypes = [...new Set(signals.map(s => s.tipoEvento))];

  if (loading) {
    return (
      <div className="signals-container">
        <div className="signals-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Sinais em Tempo Real</h1>
              <p>Acompanhe todos os sinais e oportunidades</p>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Carregando sinais...</h3>
          <p>Aguarde enquanto buscamos os dados mais recentes</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="signals-container">
        <div className="signals-header">
          <div className="header-content">
            <div className="header-title">
              <h1>Sinais em Tempo Real</h1>
              <p>Acompanhe todos os sinais e oportunidades</p>
            </div>
          </div>
        </div>
        <div className="error-container">
          <AlertCircle size={64} color="#E53935" />
          <h3>Ops! Algo deu errado</h3>
          <p>{error}</p>
          <button onClick={fetchSignals} className="retry-button">
            <RefreshCw size={18} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signals-container">
      <div className="signals-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Sinais em Tempo Real</h1>
            <p>Acompanhe todos os sinais e oportunidades</p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="refresh-button"
          >
            <RefreshCw size={20} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      <div className="signals-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{signals.length}</span>
            <span className="stat-label">Total de Sinais</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Trophy size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{new Set(signals.map(s => s.campeonato)).size}</span>
            <span className="stat-label">Campeonatos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{filteredSignals.length}</span>
            <span className="stat-label">Filtrados</span>
          </div>
        </div>
      </div>

      <div className="signals-controls">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por times ou campeonato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos os tipos</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {currentSignals.length === 0 ? (
        <div className="empty-state">
          <Target size={80} color="#E53935" />
          <h3>Nenhum sinal encontrado</h3>
          <p>Não há sinais que correspondam aos filtros aplicados.</p>
          <button onClick={() => {
            setSearchTerm("");
            setFilterType("all");
          }} className="clear-filters-button">
            Limpar Filtros
          </button>
        </div>
      ) : (
        <>
          <div className="signals-grid">
            {currentSignals.map((signal, index) => (
              <SignalCard key={signal.id} signal={signal} index={index} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Anterior
              </button>
              
              <div className="pagination-info">
                <span>Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
                <span className="results-info">({filteredSignals.length} resultados)</span>
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .signals-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif;
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .signals-header {
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 30%, #B71C1C 100%);
          padding: 48px 32px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
        }

        .signals-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(229, 57, 53, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 87, 34, 0.1) 0%, transparent 50%);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .header-title h1 {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          letter-spacing: -1px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .header-title p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          font-weight: 400;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(20px);
        }

        .refresh-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .refresh-button:active {
          transform: translateY(-1px) scale(0.98);
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .signals-stats {
          max-width: 1200px;
          margin: 0 auto 32px auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #E53935, #FF5722);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #000000;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #757575;
          font-weight: 500;
          margin-top: 4px;
        }

        .signals-controls {
          max-width: 1200px;
          margin: 0 auto 32px auto;
          padding: 0 32px;
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .search-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: white;
          border-radius: 16px;
          border: 2px solid #f0f0f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
        }

        .search-container:focus-within {
          border-color: #E53935;
          box-shadow: 0 4px 20px rgba(229, 57, 53, 0.15);
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
          background: transparent;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .filter-container {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: white;
          border-radius: 16px;
          border: 2px solid #f0f0f0;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          min-width: 200px;
        }

        .filter-container:focus-within {
          border-color: #E53935;
          box-shadow: 0 4px 20px rgba(229, 57, 53, 0.15);
        }

        .filter-select {
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
          background: transparent;
          cursor: pointer;
          flex: 1;
        }

        .signals-grid {
          max-width: 1200px;
          margin: 0 auto 48px auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 24px;
        }

        .signal-card {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid #f0f0f0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .signal-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .signal-card-border {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          border-radius: 0 4px 4px 0;
        }

        .signal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .signal-championship {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .signal-time-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #f3f4f6;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
        }

        .signal-match {
          margin-bottom: 20px;
        }

        .match-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .teams-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .teams {
          font-size: 20px;
          font-weight: 700;
          color: #000000;
          line-height: 1.2;
        }

        .score-container {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 32px;
        }

        .score {
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
        }

        .signal-action {
          margin-bottom: 20px;
        }

        .event-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .action-description {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.4;
        }

        .signal-footer {
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .signal-date {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
        }

        .loading-container, .error-container, .empty-state {
          max-width: 600px;
          margin: 80px auto;
          padding: 48px 32px;
          text-align: center;
          background: white;
          border-radius: 24px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 64px;
          height: 64px;
          border: 6px solid #f3f4f6;
          border-top: 6px solid #E53935;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px auto;
        }

        .loading-container h3, .error-container h3, .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .loading-container p, .error-container p, .empty-state p {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .retry-button, .clear-filters-button {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 32px;
          background: #E53935;
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 24px;
        }

        .retry-button:hover, .clear-filters-button:hover {
          background: #d32f2f;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(229, 57, 53, 0.3);
        }

        .pagination {
          max-width: 1200px;
          margin: 0 auto 48px auto;
          padding: 0 32px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
        }

        .pagination-button {
          padding: 16px 32px;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #374151;
        }

        .pagination-button:hover:not(:disabled) {
          border-color: #E53935;
          color: #E53935;
          background: #fef2f2;
          transform: translateY(-2px);
        }

        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-info {
          text-align: center;
          padding: 0 24px;
        }

        .pagination-info span:first-child {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
          display: block;
          margin-bottom: 4px;
        }

        .results-info {
          font-size: 14px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
          }

          .signals-header {
            padding: 32px 20px;
          }

          .signals-stats, .signals-controls, .signals-grid, .pagination {
            padding: 0 20px;
          }

          .signals-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .signals-grid {
            grid-template-columns: 1fr;
          }

          .header-title h1 {
            font-size: 28px;
          }

          .header-title p {
            font-size: 16px;
          }

          .match-info {
            gap: 8px;
          }

          .score-container {
            padding-left: 0;
          }
        }

        @media (max-width: 480px) {
          .signals-header {
            padding: 24px 16px;
          }

          .signals-stats, .signals-controls, .signals-grid, .pagination {
            padding: 0 16px;
          }

          .signal-card {
            padding: 20px;
          }

          .header-title h1 {
            font-size: 24px;
          }

          .refresh-button {
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
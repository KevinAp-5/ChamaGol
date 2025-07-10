import React, { useEffect, useState } from "react";
import { api } from "../config/api";
import "./css/Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, size]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get(`/api/users/page?page=${page}&size=${size}`);
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
      
      // Mostrar notificação quando carregar dados
      if (res.data.content?.length > 0) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (page + 1 < totalPages) {
      setPage(p => p + 1);
    }
  };

  const handleSizeChange = (e) => {
    setSize(Number(e.target.value));
    setPage(0); // Reset para primeira página
  };

  return (
    <div className="users-container">
      {/* Cabeçalho */}
      <div className="users-header">
        <h1 className="users-title">Usuários</h1>
        <p className="users-subtitle">Total de {totalElements} usuários cadastrados</p>
      </div>

      {/* Conteúdo Principal */}
      <div className="users-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3 className="empty-title">Nenhum usuário encontrado</h3>
            <p className="empty-subtitle">Não há usuários cadastrados no sistema</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user, index) => (
              <div 
                key={user.id} 
                className="user-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="user-card-header">
                  <div className="user-avatar">
                    {user.login?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-info">
                    <h4 className="user-name">{user.name}</h4>
                    <span className="user-id">ID: {user.id}</span>
                  </div>
                </div>
                <div className="user-details">
                  <div className="user-detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{user.login}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {users.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              <span className="page-info">
                Página {page + 1} de {totalPages}
              </span>
              <select 
                value={size} 
                onChange={handleSizeChange}
                className="page-size-select"
              >
                {[5, 10, 20, 50].map(opt => (
                  <option key={opt} value={opt}>{opt} por página</option>
                ))}
              </select>
            </div>
            
            <div className="pagination-buttons">
              <button 
                onClick={handlePreviousPage} 
                disabled={page === 0}
                className="pagination-btn pagination-btn-secondary"
              >
                Anterior
              </button>
              <button 
                onClick={handleNextPage} 
                disabled={page + 1 >= totalPages}
                className="pagination-btn pagination-btn-primary"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notificação */}
      {showNotification && (
        <div className="notification">
          <span className="notification-icon">✅</span>
          <span className="notification-text">Usuários carregados com sucesso!</span>
        </div>
      )}
    </div>
  );
}
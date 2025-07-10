import React, { useEffect, useState } from "react";
import { api } from "../config/api";
import "./css/VipUsers.css";

export default function ProUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    fetchProUsers();
  }, []);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  async function fetchProUsers() {
    setLoading(true);
    try {
      const res = await api.get("/api/users/pro");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Erro ao buscar usuários VIP:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const renderSkeletonCard = () => (
    <div className="pro-user-card skeleton">
      <div className="skeleton-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-info">
          <div className="skeleton-line skeleton-line-name"></div>
          <div className="skeleton-line skeleton-line-email"></div>
        </div>
        <div className="skeleton-badge"></div>
      </div>
      <div className="skeleton-details">
        <div className="skeleton-line skeleton-line-id"></div>
      </div>
    </div>
  );

  const renderUserCard = (user, index) => (
    <div 
      key={user.id} 
      className={`pro-user-card ${animateIn ? 'animate-in' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="card-header">
        <div className="user-avatar">
          <span className="avatar-text">
            {user.login ? user.login.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.login || 'Usuário'}</h3>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="pro-badge">
          <span className="badge-text">VIP</span>
        </div>
      </div>
      <div className="card-details">
        <div className="detail-item">
          <span className="detail-label">ID:</span>
          <span className="detail-value">{user.id}</span>
        </div>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className={`empty-state ${animateIn ? 'animate-in' : ''}`}>
      <div className="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path 
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" 
            fill="#757575"
          />
        </svg>
      </div>
      <h3 className="empty-title">Nenhum usuário VIP encontrado</h3>
      <p className="empty-description">
        Não há usuários com assinatura VIP no momento.
      </p>
    </div>
  );

  return (
    <div className="pro-users-container">
      {/* Header */}
      <div className="pro-users-header">
        <h1 className="header-title">Usuários VIP</h1>
        <p className="header-subtitle">
          {loading ? 'Carregando...' : `Total: ${users.length} usuários`}
        </p>
      </div>

      {/* Content */}
      <div className="pro-users-content">
        {loading ? (
          <div className="skeleton-container">
            {[...Array(3)].map((_, index) => (
              <div key={index}>{renderSkeletonCard()}</div>
            ))}
          </div>
        ) : users.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="users-grid">
            {users.map((user, index) => renderUserCard(user, index))}
          </div>
        )}
      </div>
    </div>
  );
}
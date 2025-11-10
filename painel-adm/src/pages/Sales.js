import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, RefreshCw, Search, TrendingUp, Users, Calendar, DollarSign, Crown, Lock, Unlock, Edit2, Trash2, Check, Filter, AlertCircle, PlusCircle } from 'lucide-react';
import { api } from '../config/api';
import './css/Sales.css';

const SaleForm = ({ sale, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: sale?.name || '',
    salePrice: sale?.salePrice || sale?.value || '',
    userAmount: sale?.userAmount || sale?.userLimit || '',
    saleExpiration: sale?.saleExpiration || sale?.expiresAt || '',
    description: sale?.description || '',
    userSubscriptionTime: sale?.userSubscriptionTime || 30
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-content">
            <Crown className="modal-icon" />
            <h3>{sale ? 'Editar Oferta VIP' : 'Nova Oferta VIP'}</h3>
          </div>
          <button className="close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="sale-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nome da Oferta</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Plano VIP Premium"
                required
              />
            </div>

            <div className="form-group">
              <label>Valor (R$)</label>
              <div className="input-icon">
                <DollarSign size={20} />
                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="99.90"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Limite de Usuários</label>
              <div className="input-icon">
                <Users size={20} />
                <input
                  type="number"
                  name="userAmount"
                  value={formData.userAmount}
                  onChange={handleChange}
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Data de Expiração</label>
              <div className="input-icon">
                <Calendar size={20} />
                <input
                  type="datetime-local"
                  name="saleExpiration"
                  value={formData.saleExpiration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva os benefícios desta oferta VIP..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Check size={20} />
              {sale ? 'Atualizar Oferta' : 'Criar Oferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [activeSale, setActiveSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Função para mapear dados da API para o formato do componente
  const mapSaleData = (sale) => {
    if (!sale) return null;
    return {
      ...sale,
      value: sale.salePrice,
      userLimit: sale.userAmount,
      expiresAt: sale.saleExpiration,
      isActive: sale.status === 'ACTIVE'
    };
  };

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [activeRes, allRes] = await Promise.all([
        api.get("/api/sale"),
        api.get("/api/sale/all")
      ]);
      
      const mappedActiveSale = mapSaleData(activeRes.data);
      setActiveSale(mappedActiveSale);
      
      const mappedSales = Array.isArray(allRes.data) 
        ? allRes.data.map(mapSaleData) 
        : [];
      setSales(mappedSales);
      
      console.log('Oferta ativa mapeada:', mappedActiveSale);
      console.log('Todas ofertas mapeadas:', mappedSales);
    } catch (e) {
      setError(e.message || "Erro ao carregar ofertas");
      setSales([]);
      setActiveSale(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleCreate = async (payload) => {
    try {
      await api.post("/api/sale", payload);
      await loadSales();
      setShowForm(false);
    } catch (e) {
      alert(e.message || "Erro ao criar oferta");
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      await api.put(`/api/sale/${id}`, payload);
      await loadSales();
      setShowForm(false);
      setEditing(null);
    } catch (e) {
      alert(e.message || "Erro ao atualizar oferta");
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Deseja realmente desativar a oferta ativa?")) return;
    
    try {
      await api.put("/api/sale/deactivate");
      await loadSales();
    } catch (e) {
      alert(e.message || "Erro ao desativar oferta");
    }
  };

  const handleSubmitForm = async (payload) => {
    try {
      if (editing?.id) {
        await handleUpdate(editing.id, payload);
      } else {
        await handleCreate(payload);
      }
    } catch (e) {
      throw e;
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && sale.isActive) ||
      (filter === 'inactive' && !sale.isActive);
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="sales-container">
      {error && (
        <div className="error-notification">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="sales-header">
        <div className="header-gradient">
          <div className="header-content">
            <div className="header-title">
              <Crown size={32} />
              <div>
                <h1>Ofertas VIP</h1>
                <p>Gerencie as ofertas de assinatura premium</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn-icon" onClick={loadSales} disabled={loading}>
                <RefreshCw size={20} className={loading ? 'rotating' : ''} />
              </button>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={20} />
                Nova Oferta
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sales-content">
        {activeSale && (
          <div className="active-sale-section">
            <div className="section-header">
              <TrendingUp size={24} />
              <h2>Oferta Ativa</h2>
            </div>
            <div className="active-sale-card">
              <div className="active-badge">
                <div className="badge-pulse"></div>
                ATIVA AGORA
              </div>
              <div className="sale-info-grid">
                <div className="sale-info-item">
                  <Crown size={24} />
                  <div>
                    <span className="info-label">Nome</span>
                    <span className="info-value">{activeSale.name}</span>
                  </div>
                </div>
                <div className="sale-info-item">
                  <DollarSign size={24} />
                  <div>
                    <span className="info-label">Valor</span>
                    <span className="info-value">{formatCurrency(activeSale.value)}</span>
                  </div>
                </div>
                <div className="sale-info-item">
                  <Users size={24} />
                  <div>
                    <span className="info-label">Vagas</span>
                    <span className="info-value">{activeSale.userLimit} usuários</span>
                  </div>
                </div>
                <div className="sale-info-item">
                  <Calendar size={24} />
                  <div>
                    <span className="info-label">Expira em</span>
                    <span className="info-value">{formatDate(activeSale.expiresAt)}</span>
                  </div>
                </div>
              </div>
              {activeSale.description && (
                <div className="sale-description">
                  <p>{activeSale.description}</p>
                </div>
              )}
              <div className="sale-card-actions">
                <button
                  className="btn-icon-text danger"
                  onClick={() => handleDeactivate()}
                >
                  <Lock size={18} />
                  Desativar Oferta
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="sales-list-section">
          <div className="section-header">
            <h2>Histórico de Ofertas</h2>
          </div>

          <div className="filters-bar">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Buscar ofertas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Todas
              </button>
              <button
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Ativas
              </button>
              <button
                className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
                onClick={() => setFilter('inactive')}
              >
                Inativas
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando ofertas...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="empty-state">
              <Crown size={64} />
              <h3>Nenhuma oferta encontrada</h3>
              <p>Crie sua primeira oferta VIP para começar</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <Plus size={20} />
                Criar Oferta
              </button>
            </div>
          ) : (
            <div className="sales-grid">
              {filteredSales.map(sale => (
                <div key={sale.id} className={`sale-card ${sale.isActive ? 'active' : ''}`}>
                  <div className="sale-card-header">
                    <div className="sale-title">
                      <Crown size={20} />
                      <h3>{sale.name}</h3>
                    </div>
                    <div className={`status-badge ${sale.isActive ? 'active' : 'inactive'}`}>
                      {sale.isActive ? <Unlock size={16} /> : <Lock size={16} />}
                      {sale.isActive ? 'Ativa' : 'Inativa'}
                    </div>
                  </div>

                  <div className="sale-details">
                    <div className="detail-row">
                      <DollarSign size={18} />
                      <span>{formatCurrency(sale.value)}</span>
                    </div>
                    <div className="detail-row">
                      <Users size={18} />
                      <span>{sale.userLimit} vagas</span>
                    </div>
                    <div className="detail-row">
                      <Calendar size={18} />
                      <span>{formatDate(sale.expiresAt)}</span>
                    </div>
                  </div>

                  {sale.description && (
                    <p className="sale-card-description">{sale.description}</p>
                  )}

                  <div className="sale-card-actions">
                    <button
                      className="btn-icon-text"
                      onClick={() => {
                        setEditing(sale);
                        setShowForm(true);
                      }}
                    >
                      <Edit2 size={18} />
                      Editar
                    </button>
                    {sale.isActive && (
                      <button
                        className="btn-icon-text danger"
                        onClick={() => handleDeactivate()}
                      >
                        <Lock size={18} />
                        Desativar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <SaleForm
          sale={editing}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

export default Sales;
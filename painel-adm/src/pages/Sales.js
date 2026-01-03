import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, RefreshCw, Search, TrendingUp, Users, Calendar, DollarSign, Crown, Lock, Unlock, Edit2, Check, AlertCircle, PlusCircle, AlertTriangle } from 'lucide-react';
import {api} from "../config/api";

const SaleForm = ({ sale, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: sale?.name || '',
    salePrice: sale?.salePrice || sale?.value || '',
    userAmount: sale?.userAmount || sale?.userLimit || '',
    expirationDays: sale?.expirationDays || 30,
    description: sale?.description || '',
    userSubscriptionTime: sale?.userSubscriptionTime || 30
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da oferta é obrigatório';
    }
    
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      newErrors.salePrice = 'Valor deve ser maior que zero';
    }
    
    if (!formData.userAmount || parseInt(formData.userAmount, 10) <= 0) {
      newErrors.userAmount = 'Limite de usuários deve ser maior que zero';
    }
    
    if (!formData.expirationDays || parseInt(formData.expirationDays, 10) <= 0) {
      newErrors.expirationDays = 'Dias de expiração deve ser maior que zero';
    } else if (parseInt(formData.expirationDays, 10) > 365) {
      newErrors.expirationDays = 'Dias de expiração não pode exceder 365 dias';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Converte dias para data de expiração antes de enviar
      const payload = {
        ...formData,
        saleExpiration: formData.expirationDays
      };
      
      await onSubmit(payload);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-header-content">
            <Crown className="modal-icon" />
            <div>
              <h3>{sale ? 'Editar Oferta VIP' : 'Nova Oferta VIP'}</h3>
              <p>Preencha os dados da oferta premium</p>
            </div>
          </div>
          <button className="close-button" onClick={onCancel} type="button">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sale-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome da Oferta *</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Plano VIP Premium"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="salePrice">Valor (R$) *</label>
              <div className={`input-with-icon ${errors.salePrice ? 'error' : ''}`}>
                <DollarSign size={20} />
                <input
                  id="salePrice"
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  placeholder="99.90"
                  step="0.01"
                  min="0"
                />
              </div>
              {errors.salePrice && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.salePrice}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="userAmount">Limite de Usuários *</label>
              <div className={`input-with-icon ${errors.userAmount ? 'error' : ''}`}>
                <Users size={20} />
                <input
                  id="userAmount"
                  type="number"
                  name="userAmount"
                  value={formData.userAmount}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                />
              </div>
              {errors.userAmount && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.userAmount}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expirationDays">Dias até Expiração *</label>
              <div className={`input-with-icon ${errors.expirationDays ? 'error' : ''}`}>
                <Calendar size={20} />
                <input
                  id="expirationDays"
                  type="number"
                  name="expirationDays"
                  value={formData.expirationDays}
                  onChange={handleChange}
                  placeholder="30"
                  min="1"
                  max="365"
                />
              </div>
              {errors.expirationDays && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.expirationDays}
                </span>
              )}
              <span className="helper-text">
                A oferta expira em {formData.expirationDays || 0} dia(s)
              </span>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva os benefícios desta oferta VIP..."
              rows="4"
            />
            <span className="helper-text">
              Descreva os principais benefícios e diferenciais desta oferta
            </span>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={20} className="rotating" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check size={20} />
                  {sale ? 'Atualizar Oferta' : 'Criar Oferta'}
                </>
              )}
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
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [hasActiveError, setHasActiveError] = useState(false);

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

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError("");
    setHasActiveError(false);
    
    try {
      const [activeRes, allRes] = await Promise.all([
        api.get("/api/sale").catch(err => {
          setHasActiveError(true);
          return { data: null };
        }),
        api.get("/api/sale/all")
      ]);

      const mappedActiveSale = mapSaleData(activeRes.data);
      setActiveSale(mappedActiveSale);

      const mappedSales = Array.isArray(allRes.data)
        ? allRes.data.map(mapSaleData)
        : [];
      setSales(mappedSales);

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
      showSuccess("Oferta criada com sucesso!");
    } catch (e) {
      setError(e.message || "Erro ao criar oferta");
      throw e;
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm("Deseja realmente desativar a oferta ativa?")) return;

    try {
      await api.put("/api/sale/deactivate");
      await loadSales();
      showSuccess("Oferta desativada com sucesso!");
    } catch (e) {
      setError(e.message || "Erro ao desativar oferta");
    }
  };

  const handleSubmitForm = async (payload) => {
    await handleCreate(payload);
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
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #FFFFFF;
        }

        .sales-container {
          min-height: 100vh;
          background: #FFFFFF;
        }

        /* Header */
        .sales-header {
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .header-gradient {
          background: linear-gradient(135deg, #000000 0%, #B71C1C 100%);
          padding: 24px 20px 32px;
          border-bottom-left-radius: 24px;
          border-bottom-right-radius: 24px;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 16px;
          color: #FFFFFF;
        }

        .header-title svg {
          color: #FF5722;
        }

        .header-title h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }

        .header-title p {
          font-size: 14px;
          opacity: 0.8;
          margin: 4px 0 0 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        /* Buttons */
        .btn-primary, .btn-secondary, .btn-icon, .btn-icon-text {
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #E53935;
          color: #FFFFFF;
          padding: 14px 24px;
          font-size: 15px;
        }

        .btn-primary:hover {
          background: #B71C1C;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
        }

        .btn-primary:active {
          transform: scale(0.95);
        }

        .btn-primary:disabled {
          background: #757575;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: transparent;
          color: #E53935;
          border: 2px solid #E53935;
          padding: 12px 24px;
          font-size: 15px;
        }

        .btn-secondary:hover {
          background: rgba(229, 57, 53, 0.1);
        }

        .btn-secondary:disabled {
          border-color: #757575;
          color: #757575;
          cursor: not-allowed;
        }

        .btn-icon {
          background: rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          padding: 12px;
          backdrop-filter: blur(10px);
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .btn-icon-text {
          background: transparent;
          color: #E53935;
          padding: 10px 16px;
          font-size: 14px;
          border: 1px solid #E0E0E0;
        }

        .btn-icon-text:hover {
          background: rgba(229, 57, 53, 0.05);
          border-color: #E53935;
        }

        .btn-icon-text.danger {
          color: #FF3B30;
          border-color: #E0E0E0;
        }

        .btn-icon-text.danger:hover {
          background: rgba(255, 59, 48, 0.05);
          border-color: #FF3B30;
        }

        /* Notifications */
        .error-notification, .success-notification {
          position: fixed;
          top: 24px;
          right: 24px;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          z-index: 1000;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          animation: slideInRight 0.3s ease;
          max-width: 400px;
        }

        .error-notification {
          background: #FFFFFF;
          color: #FF3B30;
          border-left: 4px solid #FF3B30;
        }

        .success-notification {
          background: #FFFFFF;
          color: #34C759;
          border-left: 4px solid #34C759;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        /* Content */
        .sales-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 20px;
        }

        /* Active Sale Section */
        .active-sale-section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          color: #000000;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .section-header svg {
          color: #E53935;
        }

        .no-active-sale {
          background: linear-gradient(135deg, #FFFFFF 0%, #FFF3F0 100%);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          border: 2px dashed #E0E0E0;
        }

        .no-active-sale svg {
          color: #757575;
          margin-bottom: 16px;
        }

        .no-active-sale h3 {
          font-size: 18px;
          font-weight: 600;
          color: #000000;
          margin: 0 0 8px 0;
        }

        .no-active-sale p {
          font-size: 14px;
          color: #757575;
          margin: 0 0 20px 0;
        }

        .active-sale-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #34C759;
          position: relative;
          overflow: hidden;
        }

        .active-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
          color: #FFFFFF;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.5px;
        }

        .badge-pulse {
          width: 8px;
          height: 8px;
          background: #FFFFFF;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.8);
          }
        }

        .sale-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 48px;
        }

        .sale-info-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .sale-info-item svg {
          color: #E53935;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .sale-info-item > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 12px;
          color: #757575;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 16px;
          color: #000000;
          font-weight: 700;
        }

        .sale-description {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #E0E0E0;
        }

        .sale-description p {
          color: #757575;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .sale-card-actions {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #E0E0E0;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box svg {
          position: absolute;
          left: 16px;
          color: #757575;
        }

        .search-box input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 2px solid #E0E0E0;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Montserrat', sans-serif;
          transition: all 0.2s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #E53935;
          box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
        }

        .filter-btn {
          padding: 12px 20px;
          border: 2px solid #E0E0E0;
          background: #FFFFFF;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #757575;
        }

        .filter-btn:hover {
          border-color: #E53935;
          color: #E53935;
        }

        .filter-btn.active {
          background: #E53935;
          border-color: #E53935;
          color: #FFFFFF;
        }

        /* Sales Grid */
        .sales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .sale-card {
          background: #FFFFFF;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #E0E0E0;
          transition: all 0.3s ease;
        }

        .sale-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .sale-card.active {
          border-left-color: #34C759;
        }

        .sale-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .sale-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .sale-title svg {
          color: #E53935;
          flex-shrink: 0;
        }

        .sale-title h3 {
          font-size: 16px;
          font-weight: 700;
          color: #000000;
          margin: 0;
          line-height: 1.3;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .status-badge.active {
          background: rgba(52, 199, 89, 0.1);
          color: #34C759;
        }

        .status-badge.inactive {
          background: rgba(117, 117, 117, 0.1);
          color: #757575;
        }

        .sale-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #757575;
          font-size: 14px;
        }

        .detail-row svg {
          color: #E53935;
          flex-shrink: 0;
        }

        .sale-card-description {
          font-size: 13px;
          color: #757575;
          line-height: 1.5;
          margin: 16px 0;
          padding-top: 16px;
          border-top: 1px solid #E0E0E0;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 64px 20px;
        }

        .empty-state svg {
          color: #E0E0E0;
          margin-bottom: 24px;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: #000000;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          font-size: 14px;
          color: #757575;
          margin: 0 0 24px 0;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 64px 20px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #E0E0E0;
          border-top-color: #E53935;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #757575;
          font-size: 14px;
          margin: 0;
        }

        .rotating {
          animation: spin 1s linear infinite;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: #FFFFFF;
          border-radius: 20px;
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.4s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(40px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          background: linear-gradient(135deg, #000000 0%, #B71C1C 100%);
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: #FFFFFF;
        }

        .modal-header-content {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          flex: 1;
        }

        .modal-icon {
          color: #FF5722;
          flex-shrink: 0;
        }

        .modal-header h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .modal-header p {
          font-size: 13px;
          opacity: 0.8;
          margin: 0;
        }

        .close-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #FFFFFF;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        /* Form */
        .sale-form {
          padding: 24px;
          overflow-y: auto;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #000000;
        }

        .form-group input,
        .form-group textarea {
          padding: 14px 16px;
          border: 2px solid #E0E0E0;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Montserrat', sans-serif;
          transition: all 0.2s ease;
          color: #000000;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #E53935;
          box-shadow: 0 0 0 3px rgba(229, 57, 53, 0.1);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #757575;
        }

        .form-group input.error,
        .form-group textarea.error {
          border-color: #FF3B30;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          left: 16px;
          color: #757575;
          pointer-events: none;
        }

        .input-with-icon input {
          padding-left: 48px;
          width: 100%;
        }

        .input-with-icon.error {
          border-color: #FF3B30;
        }

        .input-with-icon.error input {
          border-color: #FF3B30;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #FF3B30;
          font-weight: 600;
          margin-top: 4px;
        }

        .helper-text {
          font-size: 12px;
          color: #757575;
          margin-top: 4px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #E0E0E0;
          margin-top: 20px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            justify-content: flex-end;
          }

          .filters-bar {
            flex-direction: column;
          }

          .search-box {
            min-width: 100%;
          }

          .sales-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .form-actions button {
            width: 100%;
            justify-content: center;
          }

          .modal-container {
            max-height: 95vh;
          }
        }
      `}</style>

      {error && (
        <div className="error-notification">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="success-notification">
          <Check size={20} />
          {successMessage}
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
        {!loading && (
          <>
            <div className="active-sale-section">
              <div className="section-header">
                <TrendingUp size={24} />
                <h2>Oferta Ativa</h2>
              </div>

              {!activeSale && hasActiveError ? (
                <div className="no-active-sale">
                  <AlertTriangle size={48} />
                  <h3>Nenhuma oferta ativa no momento</h3>
                  <p>Crie uma nova oferta VIP para começar a vender assinaturas premium</p>
                  <button className="btn-primary" onClick={() => setShowForm(true)}>
                    <PlusCircle size={20} />
                    Criar Primeira Oferta
                  </button>
                </div>
              ) : activeSale ? (
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
              ) : null}
            </div>

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

              {filteredSales.length === 0 ? (
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
                      {sale.isActive && (
                        <div className="sale-card-actions">
                          <button
                            className="btn-icon-text danger"
                            onClick={() => handleDeactivate()}
                          >
                            <Lock size={18} />
                            Desativar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando ofertas...</p>
          </div>
        )}
      </div>

      {showForm && (
        <SaleForm
          sale={null}
           onSubmit={handleSubmitForm}
           onCancel={() => {
             setShowForm(false);
           }}
         />
       )}
     </div>
   );
 };
 
 export default Sales;
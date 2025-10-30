import React, { useState } from 'react';

export default function SaleForm({ initial = null, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [salePrice, setSalePrice] = useState(initial?.salePrice || '');
  const [userAmount, setUserAmount] = useState(initial?.userAmount ?? 0);
  const [saleExpiration, setSaleExpiration] = useState(initial?.saleExpiration || '');
  const [userSubscriptionTime, setUserSubscriptionTime] = useState(initial?.userSubscriptionTime || 30);
  const [userIlimited, setUserIlimited] = useState(initial?.userIlimited || false);

  const submit = (e) => {
    e.preventDefault();
    if (!name || !salePrice) {
      alert('Nome e valor são obrigatórios');
      return;
    }
    // ensure numeric types
    const payload = {
      name,
      salePrice: typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice,
      userAmount: userIlimited ? null : Number(userAmount),
      saleExpiration: saleExpiration || null,
      userSubscriptionTime: Number(userSubscriptionTime),
      userIlimited: !!userIlimited,
    };
    onSubmit(payload);
  };

  return (
    <form className="sale-form" onSubmit={submit}>
      <h3>{initial ? 'Editar Oferta' : 'Criar Oferta'}</h3>
      <label>
        Nome
        <input value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label>
        Valor
        <input value={salePrice} onChange={e => setSalePrice(e.target.value)} />
      </label>
      <label>
        Ilimitada por usuários
        <input type="checkbox" checked={userIlimited} onChange={e => setUserIlimited(e.target.checked)} />
      </label>
      {!userIlimited && (
        <label>
          Limite de usuários
          <input type="number" value={userAmount} onChange={e => setUserAmount(e.target.value)} min="1" />
        </label>
      )}
      <label>
        Data de expiração (ISO)
        <input value={saleExpiration || ''} onChange={e => setSaleExpiration(e.target.value)} placeholder="2025-01-01T12:00:00Z" />
      </label>
      <label>
        Tempo da assinatura (dias)
        <input type="number" value={userSubscriptionTime} onChange={e => setUserSubscriptionTime(e.target.value)} min="1" />
      </label>

      <div className="form-actions">
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
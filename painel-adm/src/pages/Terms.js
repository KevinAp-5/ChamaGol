import React, { useEffect, useState } from "react";
import { api } from "../config/api";

export default function Terms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState("");
  const [content, setContent] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(null);

  useEffect(() => {
    fetchTerms();
  }, []);

  async function fetchTerms() {
    setLoading(true);
    try {
      const res = await api.get("/api/terms");
      setTerms(res.data || []);
    } catch {
      setTerms([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!version.trim() || !content.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    try {
      await api.post("/api/terms", { version, content });
      setSuccess("Termo criado com sucesso!");
      setVersion("");
      setContent("");
      fetchTerms();
    } catch {
      setError("Erro ao criar termo.");
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>Termos de Uso</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 32 }}>
        <div>
          <label>Versão</label>
          <input
            value={version}
            onChange={e => setVersion(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </div>
        <div>
          <label>Conteúdo</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            style={{ width: "100%" }}
          />
        </div>
        {success && <div style={{ color: "green" }}>{success}</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit" style={{ marginTop: 8 }}>Criar Termo</button>
      </form>
      <h3>Histórico de Termos</h3>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ul>
          {terms.map((term, idx) => (
            <li key={idx} style={{ marginBottom: 12 }}>
              <b>Versão:</b> {term.version} <b>Data:</b> {new Date(term.createdAt).toLocaleString()}
              <button style={{ marginLeft: 8 }} onClick={() => setSelectedTerm(term)}>
                Ver detalhes
              </button>
              {selectedTerm && selectedTerm.version === term.version && (
                <div style={{ whiteSpace: "pre-wrap", marginTop: 8, border: "1px solid #ccc", padding: 8 }}>
                  {selectedTerm.content}
                  <button style={{ marginLeft: 8 }} onClick={() => setSelectedTerm(null)}>Fechar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
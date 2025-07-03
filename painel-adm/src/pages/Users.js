import React, { useEffect, useState } from "react";
import { api } from "../config/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>Usuários (Total: {totalElements})</h2>
      {loading ? <div>Carregando...</div> : (
        <ul>
          {users.map(u => (
            <li key={u.id}>
              <b>ID:</b> {u.id} | <b>Login:</b> {u.login} | <b>Email:</b> {u.email}
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: 16 }}>
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Anterior</button>
        <span style={{ margin: "0 8px" }}>Página {page + 1} de {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page + 1 >= totalPages}>Próxima</button>
        <select value={size} onChange={e => setSize(Number(e.target.value))} style={{ marginLeft: 16 }}>
          {[5, 10, 20, 50].map(opt => <option key={opt} value={opt}>{opt} por página</option>)}
        </select>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { api } from "../config/api";

export default function ProUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProUsers();
    // eslint-disable-next-line
  }, []);

  async function fetchProUsers() {
    setLoading(true);
    try {
      const res = await api.get("/api/users/pro");
      setUsers(res.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h2>Usuários PRO (Total: {users.length})</h2>
      {loading ? <div>Carregando...</div> : (
        <ul>
          {users.map(u => (
            <li key={u.id}>
              <b>ID:</b> {u.id} | <b>Login:</b> {u.login} | <b>Email:</b> {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
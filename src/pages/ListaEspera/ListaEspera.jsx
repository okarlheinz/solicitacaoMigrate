import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../utils/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Swal from "sweetalert2";
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./ListaEspera.css";

const ListaEspera = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("aberto"); // Estado para filtrar status
  const auth = getAuth();
  const user = auth.currentUser; // Pega o usuário logado

  // Função para buscar todas as solicitações do Firestore
  const fetchSolicitacoes = async () => {
    if (user) {
      let q = query(
        collection(db, "solicitacoes"),
        where("solicitante", "==", user.uid)
      );
  
      if (statusFilter !== "todos") {
        q = query(q, where("status", "==", statusFilter));
      }
  
      const querySnapshot = await getDocs(q);
      const solicitacoesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      solicitacoesList.sort((a, b) => new Date(b.data) - new Date(a.data));
      setSolicitacoes(solicitacoesList);
    }
  };
  

  useEffect(() => {
    fetchSolicitacoes();
  }, [statusFilter, user]); // Recarrega as solicitações quando o status ou o usuário muda

  // Filtragem por busca
  const filteredSolicitacoes = solicitacoes.filter((solicitacao) => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      solicitacao.nomefantasia.toLowerCase().includes(searchTerm) ||
      solicitacao.cnpj.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  // Função para exibir o modal com detalhes da solicitação
  const handleRowClick = (solicitacao) => {
    setSelectedSolicitacao(solicitacao);
    Swal.fire({
      title: "Detalhes da Solicitação",
      html: `
        <label><strong>Chave de Acesso:</strong></label><br />
        <div class="input-group mb-3">
          <input id="chaveAcessoInput" type="text" class="form-control" disabled value="${solicitacao.chaveAcesso}">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="chaveAcessoCopyBtn"><i class="fa fa-copy"></i></button>
          </div>
        </div>

        <label><strong>Chave de Parceiro:</strong></label><br />
        <div class="input-group mb-3">
          <input id="chaveParceiroInput" type="text" class="form-control" disabled value="${solicitacao.chaveParceiro}">
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button" id="chaveParceiroCopyBtn"><i class="fa fa-copy"></i></button>
          </div>
        </div>
      `,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText: "Fechar",
      didOpen: () => {
        document
          .getElementById("chaveAcessoCopyBtn")
          .addEventListener("click", () => {
            navigator.clipboard.writeText(
              document.getElementById("chaveAcessoInput").value
            );
            Swal.fire({
              icon: "success",
              title: "Chave de Acesso copiada!",
              showConfirmButton: false,
              timer: 1000,
            });
          });

        document
          .getElementById("chaveParceiroCopyBtn")
          .addEventListener("click", () => {
            navigator.clipboard.writeText(
              document.getElementById("chaveParceiroInput").value
            );
            Swal.fire({
              icon: "success",
              title: "Chave de Parceiro copiada!",
              showConfirmButton: false,
              timer: 1000,
            });
          });
      },
    });
  };

  return (
    <div className="container mt-5">
      <h2>Lista de Solicitações</h2>

      <input
        type="text"
        placeholder="Buscar por Nome Fantasia ou CNPJ"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="form-control mb-3"
      />

      {/* Filtros por status */}
      <div className="mb-3">
        <button
          className={`btn ${statusFilter === "aberto" ? "btn-primary" : "btn-outline-primary"} me-2`}
          onClick={() => setStatusFilter("aberto")}
        >
          Abertos
        </button>
        <button
          className={`btn ${statusFilter === "concluido" ? "btn-success" : "btn-outline-success"} me-2`}
          onClick={() => setStatusFilter("concluido")}
        >
          Concluídos
        </button>
        <button
          className={`btn ${statusFilter === "todos" ? "btn-secondary" : "btn-outline-secondary"} me-2`}
          onClick={() => setStatusFilter("todos")}
        >
          Todos
        </button>
        <button className="btn btn-dark"><Link to="/" className="link">Solicitar</Link></button>
      </div>

      <table className="table table-hover">
        <thead>
          <tr>
            <th>Nome Fantasia</th>
            <th>CNPJ</th>
            <th>Data</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filteredSolicitacoes.map((solicitacao) => (
            <tr key={solicitacao.id}>
              <td>{solicitacao.nomefantasia}</td>
              <td>{solicitacao.cnpj}</td>
              <td>{new Date(solicitacao.data).toLocaleString("pt-BR")}</td>
              <td>
                <span
                  className={`badge ${
                    solicitacao.status === "aberto" ? "bg-primary" : "bg-success"
                  }`}
                >
                  {solicitacao.status.charAt(0).toUpperCase() +
                    solicitacao.status.slice(1)}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleRowClick(solicitacao)}
                >
                  Ver Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
        <button className="btn btn-dark"><Link to="/" className="link">Solicitar</Link></button>
    </div>
  );
};

export default ListaEspera;

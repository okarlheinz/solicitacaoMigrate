import React, { useEffect, useState } from "react";
import { db } from "../../utils/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const EditarLista = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      const querySnapshot = await getDocs(collection(db, "solicitacoes"));
      const solicitacoesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      solicitacoesList.sort((a, b) => new Date(b.data) - new Date(a.data));
      setSolicitacoes(solicitacoesList);
    };
    fetchSolicitacoes();
  }, []);

  const handleDownloadCertificado = (solicitacao) => {
    if (solicitacao.caminhoCertificado) {
      window.open(solicitacao.caminhoCertificado, "_blank");
    } else {
      Swal.fire(
        "Erro!",
        "Nenhum certificado anexado para esta solicitação.",
        "error"
      );
    }
  };

  const handleRowClick = (solicitacao) => {
    Swal.fire({
      title: "Editar Solicitação",
      html: `
        <label><strong>Chave de Acesso:</strong></label>
        <input id="chaveAcessoInput" type="text" class="form-control mb-3" value="${
          solicitacao.chaveAcesso || ""
        }" />
        
        <label><strong>Chave de Parceiro:</strong></label>
        <input id="chaveParceiroInput" type="text" class="form-control mb-3" value="${
          solicitacao.chaveParceiro || ""
        }" />
        
        <label><strong>Status:</strong></label>
        <select id="statusSelect" class="form-control mt-2">
          <option value="aberto" ${
            solicitacao.status === "aberto" ? "selected" : ""
          }>Aberto</option>
          <option value="concluido" ${
            solicitacao.status === "concluido" ? "selected" : ""
          }>Concluído</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: "Salvar",
      cancelButtonText: "Cancelar",
      preConfirm: async () => {
        const chaveAcesso = document.getElementById("chaveAcessoInput").value;
        const chaveParceiro =
          document.getElementById("chaveParceiroInput").value;
        const status = document.getElementById("statusSelect").value;

        try {
          await updateDoc(doc(db, "solicitacoes", solicitacao.id), {
            chaveAcesso,
            chaveParceiro,
            status,
          });
          Swal.fire("Sucesso!", "Os dados foram atualizados.", "success");
          setSolicitacoes((prevSolicitacoes) =>
            prevSolicitacoes.map((s) =>
              s.id === solicitacao.id
                ? { ...s, chaveAcesso, chaveParceiro, status }
                : s
            )
          );
        } catch (error) {
          Swal.fire("Erro!", "Não foi possível atualizar os dados.", "error");
        }
      },
    });
  };

  return (
    <div className="container mt-5">
      <h2>Editar Solicitações</h2>
      <input
        type="text"
        placeholder="Buscar por Nome Fantasia ou CNPJ"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="form-control mb-3"
      />

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
          {solicitacoes
            .filter(
              (solicitacao) =>
                solicitacao.nomefantasia
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                solicitacao.cnpj
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
            .map((solicitacao) => (
              <tr key={solicitacao.id}>
                <td>{solicitacao.nomefantasia}</td>
                <td>{solicitacao.cnpj}</td>
                <td>{new Date(solicitacao.data).toLocaleString("pt-BR")}</td>
                <td>
                  <span
                    className={`badge ${
                      solicitacao.status === "aberto"
                        ? "bg-primary"
                        : "bg-success"
                    }`}
                  >
                    {solicitacao.status.charAt(0).toUpperCase() +
                      solicitacao.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="buttons">
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => handleRowClick(solicitacao)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-outline-success btn-sm ms-2"
                      onClick={() => handleDownloadCertificado(solicitacao)}
                      disabled={!solicitacao.caminhoCertificado} // Desabilita se não houver arquivo
                    >
                      <i className="bi bi-download"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditarLista;

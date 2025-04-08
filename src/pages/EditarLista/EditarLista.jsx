import React, { useEffect, useState } from "react";
import { db } from "../../utils/firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import { Button, Modal, InputGroup, FormControl } from "react-bootstrap";
import "font-awesome/css/font-awesome.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

const EditarLista = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("aberto");
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState([]);


  // MODAL
  const [show, setShow] = useState(false);
  const [dados, setDados] = useState({
    cnpj: "",
    razaoSocial: "",
    nomeFantasia: "",
    endereco: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    cep: "",
    inscricaoEstadual: "",
  });

  const handleClose = () => setShow(false);
  const handleShow = (solicitacao) => {
    if (solicitacao) {
      setDados(solicitacao); // Atualiza o estado com o CNPJ da solicitação
    }
    setShow(true);
  };

  const handleCopy = (valor) => {
    if (valor) {
      navigator.clipboard.writeText(valor).then(() => {
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Copiado para a área de transferencia!",
          timer: 1000,
        });
        // alert("Copiado para a área de transferência!");
      });
    }
  };

  // FIM MODAL

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

  useEffect(() => {
    if (statusFilter === "todos") {
      setFilteredSolicitacoes(solicitacoes);
    } else {
      setFilteredSolicitacoes(
        solicitacoes.filter((item) => item.status === statusFilter)
      );
    }
  }, [statusFilter, solicitacoes]);

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

      <div className="mb-3">
        <button
          className={`btn ${
            statusFilter === "aberto" ? "btn-primary" : "btn-outline-primary"
          } me-2`}
          onClick={() => setStatusFilter("aberto")}
        >
          Abertos
        </button>
        <button
          className={`btn ${
            statusFilter === "concluido" ? "btn-success" : "btn-outline-success"
          } me-2`}
          onClick={() => setStatusFilter("concluido")}
        >
          Concluidos
        </button>
        <button
          className={`btn ${
            statusFilter === "todos" ? "btn-secondary" : "btn-outline-secondary"
          } me-2`}
          onClick={() => setStatusFilter("todos")}
        >
          Todos
        </button>
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
          {filteredSolicitacoes
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
                    <button
                      className="btn btn-outline-danger btn-sm ms-2"
                      onClick={() => handleShow(solicitacao)}
                    >
                      Informações
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <Modal show={show} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Informações</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container-fluid">
            <div className="row">
              {/* CNPJ */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">CNPJ</label>
                <InputGroup>
                  <FormControl value={dados.cnpj} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.cnpj)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Razão Social */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Razão Social</label>
                <InputGroup>
                  <FormControl value={dados.razaosocial} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.razaosocial)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Nome Fantasia */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Nome Fantasia</label>
                <InputGroup>
                  <FormControl value={dados.nomefantasia} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.nomefantasia)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Endereço */}
              <div className="col-md-5 mb-3">
                <label className="form-label fw-bold">Endereço</label>
                <InputGroup>
                  <FormControl value={dados.logradouro} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.logradouro)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Numero */}
              <div className="col-md-2 mb-3">
                <label className="form-label fw-bold">Número</label>
                <InputGroup>
                  <FormControl value={dados.numero} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.numero)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Cidade */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Cidade</label>
                <InputGroup>
                  <FormControl value={dados.cidade} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.cidade)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Estado */}
              <div className="col-md-2 mb-3">
                <label className="form-label fw-bold">Estado</label>
                <InputGroup>
                  <FormControl value={dados.estado} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.estado)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Inscrição Estadual */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Inscrição Estadual</label>
                <InputGroup>
                  <FormControl value={dados.inscest} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.inscest)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* CEP */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">CEP</label>
                <InputGroup>
                  <FormControl value={dados.cep} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.cep)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Bairro */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Bairro</label>
                <InputGroup>
                  <FormControl value={dados.bairro} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.bairro)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Complemento */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Complemento</label>
                <InputGroup>
                  <FormControl value={dados.complemento} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.complemento)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Regime */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Regime</label>
                <InputGroup>
                  <FormControl value={dados.regime} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.regime)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Senha Certificado */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">
                  Senha do Certificado
                </label>
                <InputGroup>
                  <FormControl value={dados.senha} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.senha)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Telefone */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Fone</label>
                <InputGroup>
                  <FormControl value={dados.fone} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.fone)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>

              {/* Email */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Email</label>
                <InputGroup>
                  <FormControl value={dados.email} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.email)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>
              {/* Id Token */}
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Id Token</label>
                <InputGroup>
                  <FormControl value={dados.idtoken} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.idtoken)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>
              {/* CSC */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">CSC</label>
                <InputGroup>
                  <FormControl value={dados.csc} readOnly />
                  <Button
                    variant="outline-secondary"
                    onClick={() => handleCopy(dados.csc)}
                  >
                    <i className="bi bi-clipboard"></i>
                  </Button>
                </InputGroup>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditarLista;

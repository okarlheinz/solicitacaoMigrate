import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Formulario.css";
import Swal from "sweetalert2";

// prime react
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { InputMask } from "primereact/inputmask";

// FIREBASE
import { db, auth } from "../../utils/firebaseConfig"; // Importando a configuração do Firebase
import { collection, addDoc } from "firebase/firestore"; // Importando os métodos para adicionar dados ao Firestore
import { getAuth, onAuthStateChanged } from "firebase/auth";

// HOOKS
import UploadComponent from "../../hooks/UploadComponent";

// Definindo os valores iniciais do formulário
const initialFormData = {
  cnpj: "",
  razaosocial: "",
  nomefantasia: "",
  inscest: "",
  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  complemento: "",
  cidade: "",
  estado: "",
  idtoken: "",
  csc: "",
  regime: "Simples", // Definindo um valor padrão para o select
  senha: "",
  fone: "",
  email: "",
  data: new Date().toISOString(),
  chaveAcesso: "",
  chaveParceiro: "6YO62RZj4g4uX0l0kq+vNw==",
  status: "aberto",
  solicitante: "",
  caminhoCertificado: "",
};

const Formulario = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [currentUser, setCurrentUser] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  // Função para resetar os campos do formulário
  const resetFormData = () => {
    setFormData({ ...initialFormData, file: null, caminhoCertificado: "" });
    document.getElementById("certificado").value = ""; // Limpa o input de arquivo
  };

  // Atualiza o campo "solicitante" com o ID do usuário logado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setFormData((prevData) => ({
          ...prevData,
          solicitante: user.uid, // Adiciona o UID do usuário logado no campo "solicitante"
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Função para adicionar dados no Firestore
  const saveFormData = async () => {
    try {
      // Atualiza o formData com a URL do arquivo antes de salvar
      const updatedFormData = { ...formData, caminhoCertificado: fileUrl };

      // Adiciona os dados no Firestore na coleção "solicitacoes"
      const docRef = await addDoc(collection(db, "solicitacoes"), updatedFormData);
      console.log("Documento escrito com ID: ", docRef.id);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Formulário Enviado com Sucesso!",
        showConfirmButton: true,
        confirmButtonText: "Enviar via WhatsApp",
        showDenyButton: true,
        denyButtonText: "Enviar via E-mail",
      }).then((result) => {
        if (result.isConfirmed) {
          // Enviar via WhatsApp
          const telefone = "5581992957941";
          const mensagem = `Olá, te enviei uma solicitação de migrate para o cliente ${formData.nomefantasia} com CNPJ ${formData.cnpj}. O certificado está em ${fileUrl}`;
      
          let url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
          window.open(url, "_blank");
        } else if (result.isDenied) {
          // Enviar via E-mail
          const assunto = "Solicitação de Migrate";
          const corpoEmail = `Olá, te enviei uma solicitação de migrate para o cliente ${formData.nomefantasia} com CNPJ ${formData.cnpj}. O certificado está em ${fileUrl}`;
          
          const email = "destinatario@exemplo.com"; // Substitua pelo e-mail de destino
          let mailtoLink = `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`;
          window.location.href = mailtoLink;
        }
      });
      

      // Resetando os campos do formulário após o envio
      resetFormData();
    } catch (e) {
      console.error("Erro ao adicionar documento: ", e);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Erro ao enviar o formulário!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cnpj || 
      !formData.nomefantasia || 
      !formData.senha || 
      !formData.razaosocial || 
      !formData.cep ||
      !formData.logradouro ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.estado ||
      !formData.idtoken ||
      !formData.csc ||
      !formData.senha
    ) 
    {
      Swal.fire({
        icon: "error",
        title: "Campos obrigatórios não preenchidos",
        text: "Por favor, preencha todos os campos obrigatórios antes de enviar.",
        timer: 2500,
      });
      return; // Não prosseguir com o envio
    }
    saveFormData(); // Garante que o dado será salvo depois que o arquivo for enviado
  };

  return (
    <div className="container mt-5">
      <h2>Solicitar Migrate</h2>
      <form>
        <div className="form-group row">
          <div className="col-md-3">
            <label htmlFor="cnpj">
              CNPJ:<span style={{ color: "red" }}> *</span>
            </label>
            <InputMask
              className="form-control"
              id="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              mask="99.999.999/9999-99"
              placeholder="99.999.999/0001-91"
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="nomefantasia">
              Nome Fantasia:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="nomefantasia"
              placeholder="Ex: Kontak Lentes"
              maxLength="50"
              value={formData.nomefantasia}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-5">
            <label htmlFor="razaosocial">
              Razão Social:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="razaosocial"
              placeholder="Ex: Kontak Lentes Ltda."
              maxLength="80"
              value={formData.razaosocial}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-md-3">
            <label htmlFor="inscest">
              Inscrição Estadual:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="inscest"
              placeholder="Ex: 1234567890"
              value={formData.inscest}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="cep">
              CEP:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="cep"
              placeholder="Ex: 12345-678"
              maxLength="10"
              value={formData.cep}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="logradouro">
              Logradouro:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="logradouro"
              placeholder="Ex: Rua das Flores"
              maxLength="40"
              value={formData.logradouro}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-md-2">
            <label htmlFor="numero">
              Número:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="number"
              id="numero"
              placeholder="Ex: 123"
              value={formData.numero}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="bairro">
              Bairro:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="bairro"
              placeholder="Ex: Centro"
              maxLength="30"
              value={formData.bairro}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="complemento">Complemento:</label>
            <input
              className="form-control"
              type="text"
              id="complemento"
              placeholder="Ex: Sala 101"
              maxLength="40"
              value={formData.complemento}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="cidade">
              Cidade:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="cidade"
              placeholder="Ex: São Paulo"
              maxLength="30"
              value={formData.cidade}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-md-2">
            <label htmlFor="estado">
              Estado:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="estado"
              placeholder="Ex: SP"
              maxLength="2"
              value={formData.estado}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <label htmlFor="idtoken">
              Id Token:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="idtoken"
              placeholder="Ex: 000001"
              value={formData.idtoken}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="csc">
              CSC:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="csc"
              placeholder="Ex: G7E95181-9CD5-5AB5-8637-18D11FB827E5"
              maxLength="36"
              value={formData.csc}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="regime">
              Regime:<span style={{ color: "red" }}> *</span>
            </label>
            <select
              id="regime"
              className="form-control"
              value={formData.regime}
              onChange={handleChange}
            >
              <option value="Simples">Simples</option>
              <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        <div className="form-group row">
          <div className="col-md-2">
            <label htmlFor="senha">
              Senha do certificado:<span style={{ color: "red" }}> *</span>
            </label>
            <input
              className="form-control"
              type="text"
              id="senha"
              placeholder="Ex: 1234"
              maxLength="20"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="fone">Fone:</label>
            <InputMask
              className="form-control"
              type="text"
              id="fone"
              value={formData.fone}
              onChange={handleChange}
              mask="(99)99999-9999"
              placeholder="(81)98888-8888"
            />
          </div>
          <div className="col-md-7">
            <label htmlFor="email">E-mail:</label>
            <input
              className="form-control"
              type="text"
              id="email"
              placeholder="Ex: cliente@exemplo.com.br"
              maxLength="80"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-md-6">
            <label htmlFor="certificado">
              Certificado Digital:<span style={{ color: "red" }}> *</span>
            </label>
            <UploadComponent onUpload={(url) => setFileUrl(url)} />
          </div>
          <div className="col-md-4">
            <label className="invisible" htmlFor="button">
              Enviar
            </label>
            <button
              type="submit"
              className="btn btn-primary"
              id="generateCommandButton"
              onClick={handleSubmit}
            >
              <i className="bi bi-send"></i> Enviar Solicitação
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Formulario;

import React, { useState } from "react";
import { auth } from "../../utils/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Importando SweetAlert2

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Estado para confirmação de senha
  const [isLogin, setIsLogin] = useState(true); // Estado para alternar entre login e cadastro
  const navigate = useNavigate();

  // Função para login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      navigate("/lista-espera"); // Redireciona para a página de solicitações
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao fazer login",
        text: error.message,
        timer: 1500,
      });
    }
  };

  // Função para cadastro
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "As senhas não coincidem.",
        timer: 1500,
      });
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setUser({ email }); // Apenas registra o email por enquanto
      navigate("/lista-espera"); // Redireciona para a página de solicitações
      Swal.fire({
        icon: "success",
        title: "Conta criada com sucesso!",
        text: "Você foi redirecionado para a página de solicitações.",
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao criar conta",
        text: error.message,
        timer: 1500,
      });
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">

      <h1 className="mb-4 text-center">Solicitação de Migrate</h1>

      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4">{isLogin ? "Login" : "Cadastro"}</h2>
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Confirme a Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100 mb-3">
            {isLogin ? "Entrar" : "Criar Conta"}
          </button>
        </form>

        <div className="text-center">
          <span>
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="btn btn-link p-0">
              {isLogin ? "Cadastre-se" : "Faça login"}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

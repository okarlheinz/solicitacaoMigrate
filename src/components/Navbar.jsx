import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "./Navbar.css";
import { useState, useEffect } from "react"; 
import { auth } from "../utils/firebaseConfig" // Importe a configuração do Firebase para acessar o UID do usuário logado


export default function Navbar() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const userUID = auth.currentUser?.uid;  // Pega o UID do usuário logado

  const allowedUIDs = [
    "EsmRFQqsUAXbpS1cyGyXifvdA7p2", // UID 1
    "MEeFkgMs1hMI6HK8haKCA0BuSgk1",   // UID 2
  ];


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <nav>
      <ul>
        <li><Link to="/">Solicitar Migrate</Link></li>
        <li><Link to="/lista-espera">Lista de Solicitações</Link></li>
        {/* <li><Link to="/editar-lista">Editar Lista</Link></li> */}
        {user && (
          <>
           {/* Verifica se o UID do usuário logado é o UID específico */}
           {allowedUIDs.includes(userUID) && (
            <li><Link to="/editar-lista">Editar Lista</Link></li>
            )}
            <li>
              <span style={{color: "white"}}>Bem-vindo, {user.email}</span>
            </li>
            <li>
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

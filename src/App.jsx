import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebaseConfig";
import Navbar from "./components/Navbar";
import Formulario from "./pages/Formulario/Formulario";
import ListaEspera from "./pages/ListaEspera/ListaEspera";
import EditarLista from "./pages/EditarLista/EditarLista";
import Login from "./pages/Login/Login";
import { PrimeReactProvider } from "primereact/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <PrimeReactProvider>
      <Router>
        {user && <Navbar />} {/* Só exibe a Navbar se o usuário estiver autenticado */}
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/" element={user ? <Formulario user={user} /> : <Navigate to="/login" />} />
          <Route path="/lista-espera" element={user ? <ListaEspera user={user} /> : <Navigate to="/login" />} />
          <Route path="/editar-lista" element={user ? <EditarLista user={user} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </PrimeReactProvider>
  );
}

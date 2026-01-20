"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "react-toastify";

interface AuthContextType {
  user: string | null;
  token: string | null;
  login: (user: string, token: string) => void;
  logout: () => void;
  isLogged: boolean;
  setIslogged: (state: boolean) => void;
  loadingContext: boolean;
  handleToast: (toastType: "error" | "success", message: string) => void;
  isLoadingGlobal: boolean;
  setLoadingGlobal: (state: boolean) => void;
  userType: string | null;
  setUserType: (state: string) => void,
  isAuthorized: boolean,
  setIsAuthorized : (state:boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loadingContext, setIsloaginContext] = useState<boolean>(true);
  const [isLogged, setIslogged] = useState(false);
  const [isLoadingGlobal, setLoadingGlobal] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);


  useEffect(() => {
    const storageToken = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setUser(user);
    setToken(storageToken);
    setIsloaginContext(false);
  }, []);

  const handleToast = (toastType: string, message: string) => {
    try {
      if (toastType === "error") {
        return toast.error(message, { closeButton: true, autoClose: 4000 });
      }
      if (toastType === "success") {
        return toast.success(message, { closeButton: true, autoClose: 4000 });
      }
    } catch(err) {}
  };
  const login = (user: string, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", user);
    setUser(user);
    setToken(token);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loadingContext,
        handleToast,
        isLogged,
        setIslogged,
        isLoadingGlobal,
        setLoadingGlobal,
        userType, 
        setUserType,
        isAuthorized,
        setIsAuthorized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("Autorización incorrecta");
  }
  return context;
}

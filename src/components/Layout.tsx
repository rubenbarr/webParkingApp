"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Minimize2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { validateToken } from "@/api/authApi";

import LoadingComponent from "./Loading";
import Image from "next/image";
import logo from "./../assets/images/logoOriginalsmartparking.png";

import style from "./Layout.module.scss";

import cn from "classnames";
interface Response {
  state: boolean;
  message: string;
  data: [string] | [];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    user,
    logout,
    token,
    loadingContext,
    handleToast,
    isLogged,
    isLoadingGlobal,
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [minimize, setMinimize] = useState(false);
  const [Logged, setIsLogged] = useState(isLogged || false);
  const [validating, isValidating] = useState(false);
  const [displayMenu, setDisplayMenu] = useState(false);
  useEffect(() => {
    const validateTokenReq = async () => {
      try {
        if (!loadingContext) {
          if (!token) router.replace("login");
          isValidating(true);
          const req = (await validateToken(token as string)) as Response;
          if (req.state) {
            setIsLogged(true);
          } else {
            router.replace("/login");
          }
        }
      } catch (error) {
        handleToast("error", error as string);
        router.replace("/login");
      } finally {
        isValidating(false);
      }
    };
    validateTokenReq();
  }, [loadingContext, router]);

  const handleSideMenu = (url: string) => {
    router.replace(url);
    setMinimize(true)
  };

  const handleLogout  = () => {
    logout()
    router.replace('login')
  }
  if (loadingContext || validating) return <LoadingComponent />;
  if (!Logged) return null;

  return (
    <div className={style["content"]}>
      {isLoadingGlobal && <LoadingComponent light={true} />}

      <header className={style["header"]}>
        <div className={style["header-left"]}>
          <div className={style["header-button"]}>
            <button
              onClick={() => {
                setDisplayMenu(!displayMenu);
                setMinimize(true)
              }}
              className=""
            >
              <Menu size={24} color="#14626d" />
            </button>
          </div>
          <Image src={logo} alt="Smart Parking" width={200} />
        </div>
        <div className="">
          {user && <span className="">{user}</span>}
        </div>
      </header>
      <div className={style["content-container"]}>
        <aside className={cn(style["sidebar"], {[style['minimize']]: minimize}, {[style['expand']]: displayMenu} ) }>
          <div
            className={style["side-bar-button"]}
          >
            {minimize ? (
              <button className={style["menu-icon"]} onClick={() => setMinimize(!minimize)}>
                <Minimize2 size={20} color="white" />
              </button>
            ) : (
              <button className={style["menu-icon"]} onClick={() => setMinimize(!minimize)}>
                <X size={24} color="white" />
              </button>
            )}
          </div>
          {!minimize && (
            <div className={style["sidebar-header"]}>
              <div className={style["header-title"]}>Menu</div>
            </div>
          )}

          {!minimize && (
            <nav className={style["side-menu"]}>
              <div className={style["side-top-menu"]}>
                <div onClick={() => handleSideMenu("/dashboard")} className="">
                  Dashboard
                </div>
                <div onClick={() => handleSideMenu("/users")} className="">
                  Usuarios
                </div>
                <div onClick={() => handleSideMenu("/locations")} className="">
                  Ubicaciones
                </div>
                <div onClick={() => handleSideMenu("/kioscos")} className="">
                  Kioscos
                </div>
              </div>
              <div className={style["side-bottom-menu"]}>
                <div>Ajustes</div>
                <div onClick={handleLogout}>Salir</div>
              </div>
            </nav>
          )}
        </aside>
        <main className={style["main-content"]} onClick={()=> setMinimize(true)}>{children}</main>
      </div>
    </div>
  );
}

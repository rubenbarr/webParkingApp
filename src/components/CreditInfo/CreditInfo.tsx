import React, { useEffect, useState } from "react";

import "./creditInfoStyle.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useAuth } from "@/context/AuthContext";
import { fetchCreditInfo } from "@/store/slices/creditSlice";

interface ICreditProps {
  shouldDisplayCreditInfo?: boolean | false;
}
export default function CreditInfoComponent(props: ICreditProps) {
  const { setLoadingGlobal, token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const { creditInfo, hasCredit } = useSelector(
    (state: RootState) => state.creditInfo,
  );
  
  function getPersonalCreditInfo() {
    setLoadingGlobal(true);
    dispatch(fetchCreditInfo({ token: token as string }))
      .unwrap()
      .finally(() => setLoadingGlobal(false));
  }

  useEffect(() => {
    getPersonalCreditInfo();
  }, []);

  return (
    <div className="credit-info-content">
      <h1 className="secondary-header">Informacion de credito</h1>
      {hasCredit ? (
        <div className="content">
          <label>
            <b>{"Estatus: "}</b>
            {creditInfo?.status}
          </label>
          <label>
            <b>{"$ Credito disponible: "}</b>
            {creditInfo?.current_amount}
          </label>
        </div>
      ) : (
        <div className="no-credit">
          No puedes generar pagos, no cuentas con credito, solicita credito a tu
          administrador.
        </div>
      )}
      <button
        onClick={() => getPersonalCreditInfo()}
        className="primary-button"
      >
        Refrescar info
      </button>
    </div>
  );
}

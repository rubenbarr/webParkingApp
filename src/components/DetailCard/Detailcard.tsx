/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType, ReactNode, useEffect, useState } from "react";
import cn from "classnames";

import styles from "./styles/detailcard.module.scss";

import CloseIcon from "@/assets/icons/CloseIcon";
import MenuDotsIcon from "@/assets/icons/MenuDotsIcon";
import useDelayedUnmount from "@/assets/hooks/DelayedUnmount";
import FieldComp from "../Field/FieldComp";
import LoadingComponent from "../Loading";
import WarningIcon from "@/assets/icons/WarningIcon";
import { UserTemplate } from "@/app/users/page";

interface DetailOptions {
  label: string;
  icon: ComponentType;
  action: (props?: unknown) => void;
  requiresAuth?: boolean;
  warningTitle?: string;
}

type DetailProps = {
  detailCardState: boolean;
  handleDetailState: () => void;
  headerTitle: string;
  buttonSaveTitle: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  template: Record<string, string | any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>;
  handleValues: (key: string, value: string) => void;
  handleListValues: (
    key: string,
    value: string,
    checked: boolean,
    label: string
  ) => void;
  canSubmit: boolean;
  isEdit: boolean;
  handleSubmit: () => void;
  isLoading?: boolean;
  isNewItem: boolean;
  warningContent?: string;
  detailCardOptions?: DetailOptions[];
};

type options = {
  value: string;
  label: string;
  isChecked: boolean;
};

export default function DetailCard(props: DetailProps) {
  const shouldRender = useDelayedUnmount(props.detailCardState, 400);
  const [cardVisible, setCardVisible] = useState(false);
  const [options, setOptions] = useState<options[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [optionsTitle, setOptionsTitle] = useState("Lista");
  const [handlingItem, setHandlingItem] = useState("");
  const [warningModalState, setWarningModalState] = useState(false);
  const [renderDetailOptions, setRenderDetailOptions] = useState(false);
  const [warningAction, setWarningAction] = useState<() => void>(() => {});
  const [detailWarningTitle, setDetailWarningTitle] = useState<string>("");
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (shouldRender) {
      const t = setTimeout(() => setCardVisible(props.detailCardState), 10);
      return () => clearTimeout(t);
    }
  }, [props.detailCardState, shouldRender]);

  // useEffect(() => {
  //   if (!handlingItem) return;
  //   const valuesChecked = props.values[handlingItem];
  //   if (!Array.isArray(valuesChecked)) return;
  //   // handleItems(handlingItem, true);
  // }, [props.values, handlingItem]);


  const resetDetailCard = () => {
    setWarningModalState(false);
    setShowOptions(false);
    setRenderDetailOptions(false);
    props.handleDetailState();
  };

  const handleCheckItems = (value: string, checked: boolean, label: string) => {
    props.handleListValues(handlingItem, value, checked, label);
  };

  const handleItems = (itemKey: string, refresh: boolean = false) => {

    setHandlingItem(itemKey);
    setOptions(props.template[itemKey].values);
    setShowOptions(!showOptions)
  };

  const handleSubmit = () => {
    setShowOptions(false);
    return props.canSubmit && props.handleSubmit();
  };

  const handleDetailCard = () => {
    if (!props.isLoading) {
      if (props.isEdit) {
        setWarningModalState(true);
        setDetailWarningTitle(
          "Hay información sin guardar, ¿deseas continuar?"
        );
        setWarningAction(() => resetDetailCard);
      } else resetDetailCard();
    }
  };

  const handleDetailOptionAction = (
    action: () => void,
    requiresAuth: boolean,
    warningTitle: string = "Test"
  ) => {
    if (requiresAuth) {
      setWarningModalState(true);
      setDetailWarningTitle(warningTitle);
      const actionw = () => {
        setRenderDetailOptions(false);
        setWarningModalState(false);
        action();
      };
      setWarningAction(() => actionw);
    }
  };

  const renderModalWarning = () => {
    return (
      <div className={styles["modal-warning-body"]}>
        <div
          className={styles["modal-header-icon"]}
          onClick={() => setWarningModalState(false)}
        >
          <CloseIcon width={50} height={50} />
        </div>
        <div className={styles["modal-warning-content"]}>
          <WarningIcon width={70} height={70} />
          <label>
            {detailWarningTitle ||
              "Hay información sin guardar ¿Desea salir sin guardar?"}
          </label>
        </div>
        <div className={styles["modal-button-content"]}>
          <button onClick={() => warningAction()} className={styles["accept"]}>
            Aceptar
          </button>
          <button
            onClick={() => setWarningModalState(false)}
            className={styles["denny"]}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  };

  if (!shouldRender) return null;

  return (
    <>
      <div
        onClick={handleDetailCard}
        className={cn([styles["entity-container"]], {
          [styles["isOpen"]]: props.detailCardState,
        })}
      ></div>
      <div
        className={cn(
          styles["detail-container"],
          { [styles["isOpen"]]: cardVisible },
          { [styles["isClose"]]: !cardVisible }
        )}
      >
        {warningModalState && renderModalWarning()}
        {props.isLoading && <LoadingComponent light={true} />}
        <div className={styles["detail-header"]}>
          <div
            className={styles["detail-header-icon"]}
            onClick={handleDetailCard}
          >
            <CloseIcon width={"42px"} height={"45px"} />
          </div>
          <div>{props.headerTitle}</div>
          <div
            className={styles["detail-header-icon"]}
            onClick={() => setRenderDetailOptions(!renderDetailOptions)}
          >
            {!props.isNewItem && (
              <MenuDotsIcon width={"40px"} height={"45px"} />
            )}
          </div>
        </div>

        <div
          className={cn(styles["detail-content"])}
          onClick={() => {
            if (showOptions) setShowOptions(false);
          }}
        >
          {renderDetailOptions && props.detailCardOptions && (
            <div className={styles["options-container"]}>
              {props.detailCardOptions?.map((item: DetailOptions, index) => (
                <div
                  key={index}
                  className={styles["detail-option"]}
                  onClick={() =>
                    handleDetailOptionAction(
                      item.action,
                      item?.requiresAuth as boolean,
                      item.warningTitle
                    )
                  }
                >
                  <div>{<item.icon />}</div>
                  <label>{item.label}</label>
                </div>
              ))}
            </div>
          )}
          {Object.keys(props.template).map((k) => (
            <FieldComp
              key={k}
              ind={k}
              type={props.template[k].type}
              label={props.template[k].label}
              value={props.values[k]}
              onchange={props.handleValues}
              items={props.template[k].values}
              handleOptions={handleItems}
              canBeModified={props.template[k].canBeModified}
              isEditing={!props.isNewItem}
            />
          ))}
        </div>
        <div className={cn([styles["lower-options"]])}>
          {showOptions && (
            <div className={cn([styles["detailCard-dataList"]])}>
              <div className={cn([styles["detailCard-header"]])}>
                <div
                  className={cn(
                    styles["detail-header-icon"],
                    styles["datalist"]
                  )}
                  onClick={() => setShowOptions(false)}
                >
                  <CloseIcon width={"35px"} height={"35px"} />
                </div>
                <label>{optionsTitle}</label>
              </div>
              <div className={cn([styles["lower-options-body"]])}>
                {options.length === 0 ? (
                  <div>No hay Opciones</div>
                ) : (
                  options.map((item) => (
                    <div
                      key={item.value}
                      className={cn([styles["option-col"]])}
                    >
                      <input
                        key={item.value}
                        type="checkbox"
                        checked={item.isChecked}
                        className={cn([styles["checkbox-options"]])}
                        value={item.value}
                        onChange={(e) =>
                          handleCheckItems(
                            e.target.value,
                            e.target.checked,
                            item.label
                          )
                        }
                      />
                      <div>{item.label}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {props.isEdit && (
            <button
              className={cn(styles["detail-card-save-button"], {
                [styles["invalid-submit"]]: !props.canSubmit,
              })}
              onClick={handleSubmit}
            >
              {props.isNewItem ? "Guardar" : "Actualizar"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

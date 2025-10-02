import React from "react";
import styles from "./fieldStyle.module.scss";
import cn from "classnames";

interface FieldType {
  ind: string;
  type: string;
  label: string;
  value: string | string[] | boolean ;
  onchange: (key: string, value: string) => void;
  items: [Record<string, string>];
  handleOptions: (index: string) => void;
  isEditing?: boolean;
  canBeModified?: boolean;
}

export default function FieldComp({
  ind,
  type,
  label,
  onchange,
  items,
  handleOptions,
  isEditing = false,
  canBeModified = true,
  value,
}: FieldType) {
  const returnType = () => {
    switch (type) {
      case "input":
        return (
          <input
            key={ind}
            type="text"
            value={value as string}
            disabled={isEditing && !canBeModified}
            className={cn(styles["input-field"], {
              [styles["blocked"]]: isEditing && !canBeModified,
            })}
            onChange={(e) => onchange(ind, e.target.value)}
          />
        );
      case "list":
        return (
          <select
            name={ind}
            onChange={(e) => onchange(ind, e.target.value)}
            className={cn(styles["input-field"])}
          >
            {items.map((i) => (
              <option
                key={i.value}
                value={i.value}
                selected={ i?.value ? value as boolean :  false}
              >
                {i.label}
              </option>
            ))}
          </select>
        );
      case "datalist":
        return (
          <button
            className={cn([styles["input-field"]], [styles["button"]])}
            onClick={() => {
              handleOptions(ind);
            }}
          >
  
            {"seleccionados: " + value?.length}
          </button>
        );

      default:
        break;
    }
  };
  const returnLabelBlocked = () => {
    if (isEditing && !canBeModified) {
      return <label className={styles['label-blocked']}>Campo bloqueado</label>;
    }
  };
  return (
    <div className={cn(styles["input-container"])}>
      <div className={styles['labels-container']}>
        <label className={cn(styles["input-label"])}>{label}</label>
        {returnLabelBlocked()}
      </div>
      {returnType()}
    </div>
  );
}

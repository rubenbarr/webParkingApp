"use client";

import LoadingIcon from "@/assets/icons/LoadingIcon";
import cn from "classnames";

interface LoadingComponentProps {
  light?:boolean;
  internal?:boolean
}

export default function LoadingComponent(props: LoadingComponentProps) {
  return (
    <div className={cn("loading-container main z-100", {'light': props.light}, {'internal': props.internal})}>
      <div className={cn("loading-icon main", {'light': props.light})}>
        <LoadingIcon width="100%" height="100%" />
      </div>
    </div>
  );
}

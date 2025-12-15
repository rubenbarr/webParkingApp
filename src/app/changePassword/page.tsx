import { Suspense } from "react";
import LoadingComponent from "@/components/Loading";
import ChangePasswordClient from "./ChangePassword";

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<LoadingComponent light={true} />}>
      <ChangePasswordClient />
    </Suspense>
  );
}
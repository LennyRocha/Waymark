import { DynamicIcon } from "lucide-react/dynamic";
import { motion } from "framer-motion";
import { getAxiosErrorMessage } from "../utils/getAxiosErrorMessage";
import CustomButton from "../components/CustomButton";
import axios from "axios";

type Props = {
  error: unknown;
  retryFunction?: () => void;
};

type ErrorIcon =
  | "shield-alert"
  | "clock-alert"
  | "wifi-off"
  | "bug"
  | "octagon-x"
  | "alert-triangle"
  | "file-x"
  | "hand"
  | "user-round-x"
  | "signpost-big"
  | "package-x"
  | "server-crash"
  | "globe-x"
  | "server-off";

export default function ErrorViewComponent({
  error,
  retryFunction,
}: Readonly<Props>) {
  const icon = getIcon(error);
  return (
    <motion.div
      className="w-full h-full min-h-[25dvh] flex items-center justify-center p-4 flex-col gap-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DynamicIcon
        name={icon}
        size={48}
        className="text-text-secondary"
      />
      <h5 className="text-text-secondary">¡Ocurrió un error!</h5>
      <h6 className="text-text-secondary">
        {" "}
        {getAxiosErrorMessage(error)}
      </h6>
      {retryFunction && (
        <CustomButton
          variant="secondary"
          onClick={retryFunction}
          size="small"
          isWaiting={false}
          fullWidth={false}
          customWidth={""}
          iconName={undefined}
        >
          Reintentar
        </CustomButton>
      )}
    </motion.div>
  );
}

function getIcon(error: unknown): ErrorIcon {
  if (!axios.isAxiosError(error)) return "alert-triangle";
  if (error.code === "ECONNABORTED") return "clock-alert";
  if (
    error.message?.toLowerCase().includes("network error")
  )
    return "wifi-off";

  const status = error.response?.status;
  if (status === 400) return "package-x";
  if (status === 401) return "user-round-x";
  if (status === 403) return "hand";
  if (status === 404) return "file-x";
  if (status === 409) return "signpost-big";
  if (error.request) return "server-off";

  if (status === 500) return "server-crash";
  if (status === 501) return "globe-x";
  if (status === 503) return "server-off";
  if (status === 502) return "clock-alert";

  return "bug";
}

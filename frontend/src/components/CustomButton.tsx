import {
  DynamicIcon,
  type IconName,
} from "lucide-react/dynamic";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  isWaiting: boolean;
  fullWidth: boolean;
  customWidth: string;
  iconName: IconName | undefined;
  size: "small" | "medium" | "large";
}
const CustomButton: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isWaiting = false,
  fullWidth = false,
  iconName = undefined,
  customWidth = "",
  size = "medium",
  ...props
}) => {
  const Defclass = React.useMemo<string>(() => {
    switch (variant) {
      case "primary":
        return [
          "text-white",
          "bg-gradient-to-r",
          "from-primary-500 to-secondary-500",
          "hover:from-secondary-500 hover:to-primary-500",
          "active:from-secondary-600 active:to-secondary-600",
          "disabled:from-gray-300 disabled:to-gray-300",
        ].join(" ");
      case "secondary":
        return [
          "text-white",
          "bg-text-primary",
          "active:bg-black",
          "hover:bg-[#111111]",
          "disabled:bg-gray-400",
        ].join(" ");
      case "tertiary":
        return [
          "text-text-primary",
          "border-2 border-text-primary",
          "hover:bg-gray-100",
          "active:bg-border",
          "bg-transparent",
          "disabled:bg-gray-400 disabled:text-white disabled:border-0",
          "focus:ring-offset-1",
        ].join(" ");
      default:
        return "";
    }
  }, [variant]);
  const sizeClass = React.useMemo(() => {
    switch (size) {
      case "small":
        return "h-[40px]";
      case "medium":
        return "h-[44px]";
      case "large":
        return "h-[50px]";
    }
  }, [size]);
  return (
    <button
      className={`cursor-pointer flex items-center justify-center gap-2 ${sizeClass} px-[24px] font-semibold rounded-lg hover:inset-shadow-2xl inset-shadow-gray-500 focus:outline-none focus:ring-2  focus:ring-text-primary  transition delay-150 duration-300 ease-in-out disabled:cursor-not-allowed
        disabled:opacity-70 ${fullWidth && "w-full" } ${customWidth === "" ? "w-auto" : customWidth} ${Defclass}`}
      {...props}
      disabled={props.disabled || isWaiting}
    >
      {isWaiting ? (
        <DynamicIcon
          name="loader-circle"
          className="animate-spin"
        />
      ) : (
        <>
          {iconName && <DynamicIcon name={iconName} />}
          {children}
        </>
      )}
    </button>
  );
};

export default CustomButton;

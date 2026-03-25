import React from "react";
import {
  DynamicIcon,
  type IconName,
} from "lucide-react/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { any } from "zod";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: IconName | undefined;
  helperText: string | undefined;
  errorMessage: string | undefined;
  isWaiting: boolean;
  fullWidth: boolean;
  isError: boolean;
  inpSize: "small" | "medium" | "large";
  onIconPress?: () => void;
  ErrorElement?: React.ReactNode;
}

interface TextProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  icon: IconName | undefined;
  helperText: string | undefined;
  errorMessage: string | undefined;
  isWaiting: boolean;
  fullWidth: boolean;
  isError: boolean;
  inpSize: "small" | "medium" | "large";
  onIconPress?: () => void;
  ErrorElement?: React.ReactNode;
}

type Option = {
  label: string;
  value: string;
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  isWaiting: boolean;
  fullWidth: boolean;
  inpSize: "small" | "medium" | "large";
  ErrorElement?: React.ReactNode;
  options: Option[];
  value?: string;
  label?: string;
  placeholder?: string;
  isError?: boolean;
  errorMessage?: string;
  helperText?: string;
}

interface OtherInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CustomInput: React.FC<InputProps> = ({
  children,
  isWaiting = false,
  fullWidth = false,
  isError = false,
  inpSize = "medium",
  icon = undefined,
  helperText = undefined,
  label = "",
  ErrorElement = undefined,
  errorMessage = undefined,
  onIconPress = () => {},
  ...props
}) => {
  const sizeClass = React.useMemo(() => {
    switch (inpSize) {
      case "small":
        return "min-h-[40px]";
      case "medium":
        return "min-h-[44px]";
      case "large":
        return "min-h-[50px]";
    }
  }, [inpSize]);
  return (
    <AnimatePresence mode="wait">
      <div
        className={`min-w-[250px] ${fullWidth ? "w-full" : "w-auto"}`}
      >
        <div className="relative w-full">
          <label
            className={`text-sm font-semibold absolute top-3 left-4 ${isError ? "text-orange-500" : "text-text-secondary"}`}
          >
            {label}
          </label>
          <input
            {...props}
            className={`w-full h-auto p-4  ${label !== "" && "pt-8"} ${isError ? "border-orange-500 bg-orange-50" : "border-border"} border-2 rounded-xl ${icon && "pr-8"}  disabled:bg-gray-100 ${sizeClass} transition ease focus:outline-none focus:border-text-primary`}
            disabled={props.disabled || isWaiting}
          />
          {icon && (
            <DynamicIcon
              name={icon}
              className="absolute bottom-5 right-4"
              color="var(--color-text-primary)"
              onClick={onIconPress}
            />
          )}
        </div>
        {isError && ErrorElement ? (
          ErrorElement
        ) : isError && errorMessage ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-orange-500 mt-1 w-full text-left flex gap-1 items-center"
          >
            <DynamicIcon
              fill="var(--color-orange-500)"
              color="#fff"
              name="alert-circle"
            />
            {errorMessage}
          </motion.p>
        ) : helperText ? (
          <p className="text-sm text-text-secondary mt-1 w-full text-left">
            {helperText}
          </p>
        ) : null}
      </div>
    </AnimatePresence>
  );
};

export const CustomCheckBox: React.FC<OtherInputProps> = ({
  children,
  checked,
  ...props
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          className="peer sr-only"
          {...props}
        />

        <div
          className="
            w-[25px] h-[25px]
            rounded-md
            border-2
            border-border
            flex items-center justify-center
            transition-all
            peer-checked:bg-text-primary
            peer-checked:border-text-primary
          "
        >
          <Check color="#fff" />
        </div>
      </div>

      {children && (
        <span className="text-sm text-text-primary">
          {children}
        </span>
      )}
    </label>
  );
};

export const CustomRadioButton: React.FC<
  OtherInputProps
> = ({ children, checked, ...props }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="radio"
          checked={checked}
          className="peer sr-only"
          {...props}
        />

        <div
          className="
            w-5 h-5
            rounded-full
            border-2
            border-border
            flex items-center justify-center
            transition-all
            peer-checked:border-text-primary
          "
        >
          <div
            className="
              w-[25px] h-[25px]
              rounded-full
              bg-black
              opacity-0
              scale-50
              transition-all
              peer-checked:opacity-100
              peer-checked:scale-100
            "
          />
        </div>
      </div>

      {children && (
        <span className="text-sm text-text-primary">
          {children}
        </span>
      )}
    </label>
  );
};

export const CustomSelect: React.FC<SelectProps> = ({
  children,
  isWaiting = false,
  fullWidth = false,
  isError = false,
  inpSize = "medium",
  helperText = undefined,
  label = "",
  ErrorElement = undefined,
  errorMessage = undefined,
  options,
  value,
  placeholder = "Seleccionar...",
  ...props
}) => {
  const [open, setOpen] = React.useState(false);

  const [selected, setSelected] =
    React.useState<Option | null>(null);

  const sizeClass = React.useMemo(() => {
    switch (inpSize) {
      case "small":
        return "min-h-[40px]";
      case "medium":
        return "min-h-[44px]";
      case "large":
        return "min-h-[50px]";
    }
  }, [inpSize]);

  return (
    <div className="relative w-full min-w-[250px]">
      {/* Label */}

      {label && (
        <label
          className={`
            text-sm font-semibold
            absolute
            top-3 left-4
            ${
              isError
                ? "text-orange-500"
                : "text-text-secondary"
            }
          `}
        >
          {label}
        </label>
      )}

      {/* Trigger */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={` w-full p-4 h-auto pr-10 text-left border-2 rounded-xl ${label && "pt-8"} ${sizeClass} ${isError? "border-orange-500 bg-orange-50" : "border-border"} transition`}
      >
        {selected?.label || placeholder}

        <ChevronDown
          className={`
            absolute
            right-4
            ${label === "" ? "top-1/4" : "top-12"}
            -translate-y-1/2
            transition
            ${open && "rotate-180"}
          `}
        />
      </button>

      {/* Options */}

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="
              absolute
              mt-2
              w-full
              bg-white
              border
              border-border
              rounded-xl
              shadow-lg
              overflow-hidden
              z-50
              max-h-60
              overflow-y-auto
            "
          >
            {options.map((option) => (
              <motion.li
                key={option.value}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
                className="
                  px-4
                  py-3
                  hover:bg-gray-100
                  cursor-pointer
                  transition
                "
              >
                {option.label}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Error */}

      {isError && ErrorElement ? (
        ErrorElement
      ) : isError && errorMessage ? (
        <motion.p
          key="error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-sm text-orange-500 mt-1 w-full text-left flex gap-1 items-center"
        >
          <DynamicIcon
            fill="var(--color-orange-500)"
            color="#fff"
            name="alert-circle"
          />
          {errorMessage}
        </motion.p>
      ) : helperText ? (
        <p className="text-sm text-text-secondary mt-1 w-full text-left">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export const CustomSwitch: React.FC<OtherInputProps> = ({
  checked,
  ...props
}) => {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        className="sr-only peer"
        {...props}
      />

      <div
        className="
          w-11 h-6
          bg-gray-300
          rounded-full
          peer
          transition
          peer-checked:bg-text-primary
        "
      />

      <div
        className="
          absolute
          left-1
          top-1
          w-4 h-4
          bg-white
          rounded-full
          transition-all
          peer-checked:translate-x-5
        "
      />
    </label>
  );
};

export const CustomTextArea: React.FC<TextProps> = ({
  children,
  isWaiting = false,
  fullWidth = false,
  isError = false,
  inpSize = "medium",
  icon = undefined,
  helperText = undefined,
  label = "",
  ErrorElement = undefined,
  errorMessage = undefined,
  onIconPress = () => {},
  ...props
}) => {
  const sizeClass = React.useMemo(() => {
    switch (inpSize) {
      case "small":
        return "min-h-[40px]";
      case "medium":
        return "min-h-[44px]";
      case "large":
        return "min-h-[50px]";
    }
  }, [inpSize]);
  return (
    <AnimatePresence mode="wait">
      <div
        className={`min-w-[250px] ${fullWidth ? "w-full" : "w-auto"}`}
      >
        <div className="relative w-full">
          <label
            className={`text-sm font-semibold absolute top-3 left-4 ${isError ? "text-orange-500" : "text-text-secondary"}`}
          >
            {label}
          </label>
          <textarea
            {...props}
            className={`scroll-mini is_y w-full h-auto resize-none p-4  ${label !== "" && "pt-8"} ${isError ? "border-orange-500 bg-orange-50" : "border-border"} border-2 rounded-xl ${icon && "pr-8"}  disabled:bg-gray-100 ${sizeClass} transition ease focus:outline-none focus:border-text-primary`}
            disabled={props.disabled || isWaiting}
          />
          {icon && (
            <DynamicIcon
              name={icon}
              className="absolute top-8 right-4"
              color="var(--color-text-primary)"
              onClick={onIconPress}
            />
          )}
        </div>
        {isError && ErrorElement ? (
          ErrorElement
        ) : isError && errorMessage ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-orange-500 mt-1 w-full text-left flex gap-1 items-center"
          >
            <DynamicIcon
              fill="var(--color-orange-500)"
              color="#fff"
              name="alert-circle"
            />
            {errorMessage}
          </motion.p>
        ) : helperText ? (
          <p className="text-sm text-text-secondary mt-1 w-full text-left">
            {helperText}
          </p>
        ) : null}
      </div>
    </AnimatePresence>
  );
};

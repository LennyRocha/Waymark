import React from "react";
import type Imagen from "../types/Imagen";
import { useDropzone } from "react-dropzone";
import { Pencil, X, ImagePlus } from "lucide-react";

type Props = {
  img: Imagen;
  action?: "add" | "replace";
  index: number;
  onDrop: (file: File[], index: number) => void;
  onDelete: (index: number) => void;
  onUpdate?: (file: File, index: number) => void;
  change?: (key: string, value: any) => void;
};

export default function DropZoneItem({
  img,
  action = "add",
  index,
  onDrop,
  onDelete,
}: Readonly<Props>) {
  const { getRootProps, getInputProps, open } = useDropzone(
    {
      onDrop: (files) => onDrop(files, index),
      accept: {
        "image/jpeg": [],
        "image/png": [],
        "image/webp": [],
      },
      maxFiles: 1,
    },
  );

  const getImageSrc = (img: Imagen) => {
    if (!img?.url) return;
    if (img.url instanceof File) return img.preview;
    return img.url;
  };

  const src = getImageSrc(img);

  return (
    <div
      className="w-full aspect-video min-h-[150px] rounded-xl overflow-hidden relative bg-transparent md:min-w-[120px] lg:min-w-[175px] cursor-pointer border-2 border-dashed border-border flex items-center justify-center"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {src ? (
        <>
          <img
            src={src}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            alt={`Imagen #${img.orden} de la propiedad`}
          />
          <div className="flex gap-2 absolute top-1 right-1">
            {action === "add" ? (
              <button
                aria-label="Quitar imagen"
                type="button"
                title="Quitar imágen"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(index);
                }}
                className="bg-white rounded-full p-2 "
              >
                <X size={18} />
              </button>
            ) : (
              <button
                aria-label="Modificar imágen"
                type="button"
                title="Modificar imágen"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
                className="bg-white rounded-full p-2 "
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="w-full h-full flex  flex-col items-center justify-center text-text-secondary text-xl">
          <ImagePlus size={32} />
          <span className="text-sm">
            {index === 0
              ? "Agregar o arrastrar portada"
              : "Agregar o arrastrar imagen"}
          </span>
        </div>
      )}
    </div>
  );
}

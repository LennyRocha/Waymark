// @ts-nocheck
import React, { useState } from "react";
import CustomLink from "../../components/CustomLink";
import useHostPropiedades from "./hooks/useHostPropiedades";
import DataTable from "react-data-table-component";
import CustomLoader from "../../layout/CustomLoader";
import EmptyListComponent from "../../layout/EmptyListComponent";
import {
  CustomSwitch,
  MediumInput,
} from "../../components/CustomInputs";
import CustomButton from "../../components/CustomButton";
import { X, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ErrorViewComponent from "../../layout/ErrorViewComponent";
import Breadcrumb from "../../components/Breadcrumb";
import Modal from "../../layout/Modal";
import usePropiedadMutation from "./hooks/usePropiedadMutation";
import toast from "react-hot-toast";
import { getAxiosErrorMessage } from "../../utils/getAxiosErrorMessage";
import useSetPageTitle from "../../utils/setPageTitle";
import { useQueryClient } from "@tanstack/react-query";

export default function MisPropiedades() {
  useSetPageTitle("Mis propiedades - Waymark");
  const propiedades = useHostPropiedades({});
  const navigate = useNavigate();

  const [filtro, setFiltro] = React.useState("");

  const sortedListings = (propiedades?.data ?? []).filter(
    (listing) =>
      listing.titulo
        .toLowerCase()
        .includes(filtro.toLowerCase()),
  );

  const links = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Anfitrión",
      href: "/host",
    },
    {
      label: "Mis propiedades",
      href: "/host/listings",
      disabled: true,
    },
  ];

  const [show, setShow] = useState(false);

  const [id, setId] = useState(null);

  function openModal(id) {
    setShow(true);
    setId(id);
  }

  function closeModal() {
    setShow(false);
    setId(null);
  }

  const queryClient = useQueryClient();

  const mutation = usePropiedadMutation(
    {
      onSuccess: () => {
        propiedades.refetch();
        closeModal();
        toast.success("¡Estado de propiedad actualizado!");
        queryClient.invalidateQueries({
          queryKey: ["propiedad"],
        });
      },
      onerror: (error) => {
        const message = getAxiosErrorMessage(error);
        closeModal();
        toast.error(
          message ||
            "Error al actualizar el estado de la propiedad",
        );
      },
    },
    "delete",
  );

  return (
    <div className="content">
      <Breadcrumb items={links} />
      <h5 className="text-left mt-4">
        {" "}
        {propiedades.data
          ? `${propiedades.data?.length || 0} propiedades`
          : "Mis propiedades"}
      </h5>
      {propiedades.isError ? (
        <ErrorViewComponent
          error={propiedades.error}
          retryFunction={() => propiedades.refetch()}
        />
      ) : (
        <DataTable
          columns={retrieveColumns(openModal)}
          data={sortedListings ?? []}
          pagination
          paginationPerPage={5}
          linkComponent={CustomLink}
          highlightOnHover
          responsive
          customStyles={tableStyles}
          subHeader
          subHeaderComponent={
            <Subheader
              isError={propiedades.isError}
              isLoading={
                propiedades.isInitialLoading ||
                propiedades.isLoading
              }
              filtro={filtro}
              setFiltro={setFiltro}
              navigate={navigate}
            />
          }
          subHeaderAlign="left"
          noDataComponent={
            <EmptyListComponent
              titulo="¡Ups!"
              mensaje="No hay propiedades disponibles"
            />
          }
          progressPending={
            propiedades.isInitialLoading ||
            propiedades.isLoading
          }
          progressComponent={<CustomLoader />}
          compact
          paginationRowsPerPageOptions={[5, 10, 15, 20]}
        />
      )}
      <Modal
        open={show}
        close={() => closeModal()}
        width={"min(600px, 100%)"}
      >
        <Modal.Header>
          <h2>¿Cambiar estado?</h2>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro de cambiar el estado de esta
            propiedad? Ten en cuenta que pueden haber
            reservaciones activas.{" "}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <CustomButton
            isWaiting={mutation.isPending}
            onClick={() => mutation.mutate(id)}
          >
            Confirmar
          </CustomButton>
          <CustomButton
            disabled={mutation.isPending}
            onClick={() => closeModal()}
          >
            Cancelar
          </CustomButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function retrieveColumns(openModal) {
  const columnas = [
    {
      name: "Propiedad",
      cell: (row) => (
        <div className="flex items-center justify-start  gap-2 px-2 w-full  max-w-[350px] overflow-hidden">
          <img
            src={
              row.imagenes[0]?.url ||
              "https://via.placeholder.com/50"
            }
            alt={row.slug}
            className="aspect-video w-[6rem] object-cover rounded-md"
          />
          <div className="flex flex-col items-left justify-center">
            <p className="text-left font-bold text-wrap">
              {row.titulo}
            </p>
            <small className="text-[0.5rem] font-light max-h-[50px] text-left truncate  max-w-[250px] text-justify">
              {row.descripcion}
            </small>
          </div>
        </div>
      ),
    },
    {
      name: "Estado",
      cell: (row) => (
        <div className="flex items-center justify-center  gap-2 px-2 w-full">
          <span
            className={`${row.activa ? "bg-green-500" : "bg-red-500"} aspect-square w-2 rounded-full shrink-0`}
          ></span>
          <p className="text-left text-text-secondary font-bold">
            {row.activa ? "Activa" : "Inactiva"}
          </p>
        </div>
      ),
      sortable: false,
      width: "125px",
      center: true,
    },
    {
      name: "Recámaras",
      selector: (row) => row.habitaciones,
      sortable: true,
      width: "120px",
      center: true,
    },
    {
      name: "Camas",
      selector: (row) => row.camas,
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "Baños",
      selector: (row) => row.banos,
      sortable: true,
      width: "100px",
      center: true,
    },
    {
      name: "Ubicación",
      selector: (row) => `${row.ciudad}, ${row.pais}`,
      sortable: true,
      width: "200px",
      center: true,
      wrap: true,
    },
    {
      name: "Modifcado",
      selector: (row) =>
        new Date(row.updated_at).toLocaleString("es-MX"),
      sortable: true,
      width: "200px",
      center: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex gap-2 justify-center items-center px-2 w-[fit-content]">
          <CustomLink
            to={`/host/manage-listing/${row.propiedad_id}-${row.slug}`}
          >
            <Pencil size={16} />
            Editar
          </CustomLink>
          <div>
            <CustomSwitch
              checked={row.activa}
              onChange={() => openModal(row.propiedad_id)}
            />
          </div>
        </div>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
    },
  ];

  return columnas;
}

type SubHeaderProps = {
  isLoading: boolean;
  filro: string;
  setFiltro: (value: string) => void;
  navigate: (path: string) => void;
  isError: boolean;
};
const Subheader = ({
  isLoading,
  filtro,
  setFiltro,
  navigate,
  isError,
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-2 max-md:flex-col">
      <div className="flex items-center gap-1">
        <MediumInput
          placeholder="Buscar propiedad..."
          value={filtro}
          icon="search"
          isWaiting={isLoading}
          onChange={(e) => setFiltro(e.target.value)}
          disabled={isError}
        />
        {filtro && (
          <CustomButton
            type="button"
            variant="tertiary"
            onClick={() => setFiltro("")}
          >
            <X size={18} />
          </CustomButton>
        )}
      </div>
      <CustomButton
        variant="primary"
        size="small"
        iconName="plus"
        onClick={() => navigate("/host/new-listing")}
        isWaiting={isLoading}
      >
        Nueva
      </CustomButton>
    </div>
  );
};

const tableStyles = {
  rows: {
    style: {
      minWidth: "fit-content",
      padding: "1rem 0.5rem",
      fontFamily: "'Montserrat', serif",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
    },
  },
  headCells: {
    style: {
      fontFamily: "'Cabin', serif",
      fontSize: "0.85rem",
      fontWeight: "700",
    },
  },
  pagination: {
    select: {
      style: {
        color: "#000",
        backgroundColor: "#fff",
      },
    },
  },
};

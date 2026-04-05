import useFavoritos from "./hooks/useFavoritos";
import Breadcrumb from "../../components/Breadcrumb";
import CustomLoader from "../../layout/CustomLoader";
import ErrorViewComponent from "../../layout/ErrorViewComponent";
import useSetPageTitle from "../../utils/setPageTitle";
import { HeartPlus } from "lucide-react";
import { motion } from "framer-motion";
import PropiedadCard from "./components/PropiedadCard";

type Props = {};

export default function MisFavoritos({}: Props) {
  const links = [
    {
      label: "Inicio",
      href: "/guest",
    },
    {
      label: "Favoritos",
      href: "/guest/favorites",
      disabed: true,
    },
  ];
  const favoritos = useFavoritos();
  const favoritosAgrupados = chunkArray(
    favoritos.data ?? [],
    7,
  );
  useSetPageTitle(
    "Waymark - Encuentra el lugar perfecto para tu próxima aventura",
  );
  if (favoritos.isLoading || favoritos.isInitialLoading)
    return (
      <main className="w-[100dvw] h-[100dvh] flex items-center justify-center">
        <CustomLoader />
      </main>
    );
  if (favoritos.isError)
    return (
      <main className="w-[100dvw] h-[100dvh]">
        <ErrorViewComponent
          error={favoritos.error}
          retryFunction={() => {
            favoritos.refetch();
          }}
        />
      </main>
    );
  return (
    <main className="w-full flex flex-col items-center lg:items-start justify-center gap-1 content">
      <Breadcrumb items={links} />
      <h5 className="mt-4">Mis favoritos</h5>
      {favoritos.data?.length === 0 ? (
        <EmptyFavoritos
          mensaje="Aún no has marcado ninguna propiedad como favorita, comienza a explorar y marca las que más te gusten."
          titulo="Sin favoritos"
        />
      ) : (
        favoritosAgrupados.map((grupo, index) => (
          <section
            key={index + 1}
            className="inline-flex w-full overflow-x-auto overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth mb-5"
          >
            {grupo.map((item) => (
              <PropiedadCard
                key={item.propiedad_id}
                propiedad={item}
              />
            ))}
          </section>
        ))
      )}
    </main>
  );
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

type EmptyProps = {
  titulo?: string;
  mensaje: string;
};

function EmptyFavoritos({
  titulo,
  mensaje,
}: Readonly<EmptyProps>) {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center p-4 flex-col gap-2 min-h-[50dvh]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeartPlus
        size={48}
        className="text-text-secondary"
        fill="var(--color-border)"
      />
      {titulo && (
        <h5 className="text-text-secondary">{titulo}</h5>
      )}
      <h6 className="text-text-secondary">{mensaje}</h6>
    </motion.div>
  );
}

import useSetPageTitle from "../../utils/setPageTitle";
import error_gif from "../../assets/error_gif.gif";
import CustomLink from "../../components/CustomLink";
import { Link } from "react-router-dom";

export default function Page404() {
  useSetPageTitle("Página no encontrada - Waymark");
  return (
    <main className="min-h-[100dvh]">
      <header className=" w-full p-4 max-w-[1080px] mx-auto">
        <Link
          to="/"
          className="flex gap-2 items-center justify-start w-fit"
        >
          <img
            src="/logo_white.png"
            alt="WAYMARK"
            className="h-12 aspect-square w-auto"
          />
          <span className="rotulo text-primary-500">WAYMARK</span>
        </Link>
      </header>
      <section className="h-max  w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-6 p-4 max-w-[1080px] mx-auto flex-1">
        <div className="flex flex-col gap-2">
          <h1 className="text-left text-2xl" id="error_h1">Oops!</h1>
          <h3 className="text-left w-full">
            La página que estas buscando no existe.
          </h3>
          <h6 className="text-left">
            Código de error: 404
          </h6>
          <p className="text-left">
            Aquí hay algunos enlaces útiles:
          </p>
          <div>
            <CustomLink disabled={false} to={"/"}>
              Inicio
            </CustomLink>
            <CustomLink disabled={false} to={"/s/homes"}>
              Buscar
            </CustomLink>
            <CustomLink disabled={false} to={"/login"}>
              Iniciar sesión
            </CustomLink>
            <CustomLink disabled={false} to={"/about"}>
              Acerca de
            </CustomLink>
            <CustomLink disabled={false} to={"/sitemap"}>
              Sitemap
            </CustomLink>
          </div>
        </div>
        <img
          src={error_gif}
          alt="Error 404 - Página no encontrada"
          className="aspect-square cover w-full md:w-[30dvw] h-full"
        />
      </section>
    </main>
  );
}

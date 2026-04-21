import { Link } from "react-router-dom";
import Footer from "../../layout/Footer";
import Breadcrumb from "../../components/Breadcrumb";
export default function About() {
  const links = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Acerca de Waymark",
      href: "/about",
      disabled: true,
    },
  ];
  return (
    <>
      <main className="content min-h-[100dvh] p-4 mx-auto">
        <header className=" w-full">
          <Link
            to="/"
            className="flex gap-2 items-center justify-start w-fit"
          >
            <img
              src="/logo_white.png"
              alt="WAYMARK"
              className="h-12 aspect-square w-auto"
            />
            <span className="rotulo text-primary-500">
              WAYMARK
            </span>
          </Link>
        </header>

        <section id="about" className="flex flex-col gap-4 mt-4">
          <Breadcrumb items={links} />
          <article className="flex flex-col gap-2">
            <h1>Acerca de Waymark</h1>
            <h3>Descripción del proyecto</h3>
            <p>
              Waymark es una plataforma web desarrollada con
              el propósito de facilitar la visualización y
              gestión de propiedades disponibles para renta
              o reservación. El sistema permite a los
              usuarios explorar propiedades, visualizar
              información detallada, consultar imágenes y
              realizar solicitudes de reserva dentro de la
              plataforma.
            </p>
          </article>
          <Divider />
          <article className="flex flex-col gap-2">
            <h3>Propósito académico</h3>
            <p>
              Este sistema ha sido desarrollado
              exclusivamente como un proyecto escolar, con
              fines educativos y demostrativos. Forma parte
              de un proceso de aprendizaje enfocado en el
              desarrollo de aplicaciones web modernas,
              manejo de bases de datos y despliegue en
              entornos de producción. El proyecto no tiene
              fines comerciales ni representa un servicio
              real de renta o reservación de propiedades.
            </p>
          </article>
          <Divider />
          <article className="flex flex-col gap-2">
            <h3>Alcance del sistema </h3>
            <p>La plataforma permite:</p>
            <ul className="list-disc ml-4 w-fit">
              <li>
                Registro e inicio de sesión de usuarios
              </li>
              <li>Visualización de propiedades</li>
              <li>Carga y visualización de imágenes</li>
              <li>Gestión de reservas simuladas</li>
              <li>Calificación de propiedades</li>
            </ul>
            <p>
              Las funcionalidades están diseñadas únicamente
              para fines demostrativos.
            </p>
          </article>
          <Divider />
          <article className="flex flex-col gap-2">
            <h3>Uso de datos</h3>
            <p>
              Los datos almacenados en esta plataforma son
              utilizados únicamente para pruebas y
              demostración académica.
            </p>
            <p>
              Se recomienda a los usuarios no ingresar
              información personal sensible, como:
            </p>
            <ul className="list-disc ml-4 w-fit">
              <li>Datos financieros</li>
              <li>Información confidencial</li>
              <li>Documentos oficiales reales</li>
            </ul>
            <p>
              Las imágenes y datos cargados pueden ser
              utilizados únicamente con fines de prueba.
            </p>
          </article>
          <Divider />
          <article className="flex flex-col gap-2">
            <h3>Responsabilidad y limitaciones</h3>
            <p>
              Este sistema no garantiza disponibilidad
              continua, seguridad absoluta ni integridad
              permanente de los datos.
            </p>
            <p>
              El sistema puede ser reiniciado, modificado o
              eliminado en cualquier momento como parte del
              proceso académico.
            </p>
            <p>
              No se ofrece soporte técnico formal ni
              garantías de funcionamiento.
            </p>
          </article>
          <Divider />
          <article className="flex flex-col gap-2">
            <h3>Información del equipo</h3>
            <p>Proyecto desarrollado por: Equipo Synverge.</p>
            <p>
              Institución educativa: Universidad Tecnológica
              Emiliano Zapata
            </p>
            <p>
              Carrera o programa académico: Ingería en
              Desarrollo y Gestión de Software
            </p>
            <p>Año: 2026</p>
          </article>
          <Divider />
          <article className="flex flex-col gap-2">
            <h3>Aviso final</h3>
            <p>
              Este sistema es una demostración tecnológica
              con fines educativos. No representa una
              plataforma comercial ni un servicio oficial de
              renta o reservación de propiedades.
            </p>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}

const Divider = () => (
  <div className="h-px w-full bg-gray-200 mt-2" />
);

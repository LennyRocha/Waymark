import { Link } from "react-router-dom"
import { useState } from "react";

export default function RutaRandom() {
  const [count, setCount] = useState(0);

  let size = 0;

  window.addEventListener("resize", () => {
    size = window.innerWidth;
    setCount(size);
    console.log(size);
    console.log("resize ", document.getElementById("root").clientWidth);
  });

  return (
    <div>
      <p>RutaRandom es la subruta</p>
      <h1>Encabezado h1</h1>
      <h2>Encabezado h2</h2>
      <h3>Encabezado h3</h3>
      <h4>Encabezado h4</h4>
      <h5>Encabezado h5</h5>
      <h6>Encanbezado h6</h6>
      <div className="flex justify-center items-center gap-4 flex-wrap">
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded">
          Botón primario {count} px
        </button>
        <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded">
          Botón secundario
        </button>
      </div>
      <p>
        Etiqueta p.  Edit <code>src/App.jsx</code> and save to test HMR
      </p>
      <div className="w-auto border border-border p-2 rounded">
        Card con borde
      </div>
      <div className="w-auto bg-surface p-6 rounded shadow  text-text-secondary">
        <h2 className="font-bold">Card</h2>
        <small >Texto pequeño</small>
        <br />
        <b >Texto en negrita</b>
      </div>
      <Link to="/">Home</Link>
    </div>
  )
}

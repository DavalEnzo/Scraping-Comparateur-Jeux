import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "./lotties/switch_loading.json";
import trophy from "./lotties/trophy.json";
import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from "react-confetti";
function App() {
  const [search, setSearch] = useState("");
  const [game, setGame] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowSize();

  const plateformes = [
    {
      nom: "Instant Gaming",
      nomApi: "instant_gaming",
      logo: "https://www.phasmophobia-fr.com/wp-content/uploads/2021/09/IG.png",
    },
    {
      nom: "G2A",
      nomApi: "g2a",
      logo: "https://g2acowebproddata.blob.core.windows.net/g2acowebproddata/2020/06/G2A_logo_RGB_basic_on_white.png",
    },
    {
      nom: "Steam",
      nomApi: "steam",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/800px-Steam_icon_logo.svg.png",
    }
  ];

  useEffect(() => {
    if (game !== "") {
      setData([]);
      setLoading(true);
      axios.get(`http://localhost:5000/${game}`)
        .then((res) => {
          setData(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [game]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setGame(search);
  }

  const displayData = () => {
    // Separate platforms with a price of 0 and others
    const zeroPricePlatforms = Object.entries(data.results).filter(([key, value]) => value.price === 0);
    const otherPlatforms = Object.entries(data.results).filter(([key, value]) => value.price > 0);

    // Sort other platforms by ranking
    const sortedOtherPlatforms = otherPlatforms.sort((a, b) => {
      return data.ranking[a[0]] - data.ranking[b[0]];
    });

    // Assemble the podium
    const usedKeys = new Set(); // Track keys to avoid duplicates
    let sortedData = [];

    if (zeroPricePlatforms.length > 0) {
      sortedData.push(zeroPricePlatforms[0]); // Add first free platform to position 1
      usedKeys.add(zeroPricePlatforms[0][0]);
    }

    if (sortedOtherPlatforms.length > 0) {
      sortedData.push(sortedOtherPlatforms[0]); // Add best-ranked paid platform to position 2
      usedKeys.add(sortedOtherPlatforms[0][0]);
    }

    if (zeroPricePlatforms.length > 1) {
      sortedData.push(zeroPricePlatforms[1]); // Add second free platform to position 3
      usedKeys.add(zeroPricePlatforms[1][0]);
    } else if (sortedOtherPlatforms.length > 1) {
      sortedData.push(sortedOtherPlatforms[1]); // Add next best-ranked paid platform to position 3
      usedKeys.add(sortedOtherPlatforms[1][0]);
    }

    // Add remaining platforms that are not on the podium
    const remainingPlatforms = [...zeroPricePlatforms, ...sortedOtherPlatforms].filter(
      ([key]) => !usedKeys.has(key)
    );
    sortedData = [...sortedData, ...remainingPlatforms];

    return (
      <>
        <h3 style={{ fontWeight: "bold" }} className={"text-center mt-5"}>{data.game}</h3>
        <h1 className={"text-center"}>Plateformes</h1>
        <p className={"text-center"}>Cliquez sur une plateforme pour acheter le jeu</p>
        <div className="d-flex justify-content-center align-content-center">
          {sortedData.map(([key, value], index) => {
            const plateforme = plateformes.find(plateforme => plateforme.nomApi === key);
            let hauteur = 0;

            // Determine podium height for the first three positions
            if (index === 0) { // 1st position
              hauteur = 50;
            } else if (index === 1) { // 2nd position
              hauteur = 100;
            } else if (index === 2) { // 3rd position
              hauteur = 10;
            }

            return (
              <div key={key} role={"button"} onClick={() => window.open(value.url, '_blank')} data-toggle="tooltip" data-placement="top" title="Aller sur la page d'achat du jeu" className={"d-flex flex-column align-content-center justify-content-end w-75"}>
                <Confetti width={width} height={height} recycle={false} numberOfPieces={1000}/>
                <div className={"animation-link d-flex flex-column align-content-center"}>
                  {index === 1 && <Lottie style={{height: '150px'}} options={{ loop: false, autoplay: true, animationData: trophy }} />}
                  <img style={{ width: "70%" }} className={"mx-auto rounded"} src={plateforme.logo} alt={plateforme.nom} />
                  <p className={"text-center"}>{plateforme.nom}</p>
                  <p className={"text-center"}>{value.price}€</p>
                </div>
                {value.price > 0 && index < 3 && <div style={{ height: hauteur + 'px', backgroundColor: "orange" }}></div>}
              </div>
            );
          })}
        </div>
        <div className={"d-flex flex-column justify-content-center align-content-center"}>
          <p className={"text-center"}>Ces résultats ont été trouvés en {data.time_taken} secondes</p>
        </div>
      </>
    );
  };


  return (
    <div className="my-4 d-flex flex-column justify-content-center gap-2">
      <h1 className={"text-center"}>Comparateur de prix jeux-vidéo 🎮</h1>
      <div className={"w-50 mx-auto d-flex flex-column gap-2"}>
        {loading && <div>
          <Lottie options={{loop: true, autoplay: true, animationData: animationData}} height={200} width={200}/>
          <p className={"text-center"}>Détendez-vous, nous recherchons les meilleurs prix pour vous !</p>
        </div>
        }
        {Object.keys(data).length > 0 && displayData()}
        {!loading && <><div className={"d-flex flex-column"}>
          <label htmlFor="search" className={"form-label"}>Entrez le nom du jeu</label>
          <input type="text" id="search" name={"search"} value={search} onChange={handleSearch}
                 className={"form-control"}/>
          <button onClick={handleSubmit} className={"btn btn-primary mt-3 w-50 mx-auto"}>Rechercher</button>
        </div>
        </>
        }
      </div>
    </div>
  );
}

export default App;
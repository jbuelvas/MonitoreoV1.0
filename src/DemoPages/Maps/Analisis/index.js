import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { loadModules } from "esri-loader";

let viewMap;
let polygonGraphic;
let refPredio;
let queryParamsPredio;
let queryParamsDireccion;
let queryParamsBarrio;
let queryConsultaPredio;
let queryConsultaDireccion;
let queryConsultaBarrio;
let queryConsultaUsos;

let predioLocalizado = false;

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export const MapaComponente = (props) => {
  const [map, setMap] = useState(null);
  const [view, setView] = useState(null);

  const [valueTabUso, setValueTabUso] = useState(0);
  const [valueTabOtros, setValueTabOtros] = useState(0);

  const [openCertificados, setOpenCertificados] = useState(false);

  const [predioConsultado, setPredioConsultado] = useState(false);
  const [mensajeConsulta, setMensajeConsulta] = useState("");
  const [openDialogUso, setOpenDialogUso] = useState(false);
  const [openDialogOtros, setOpenDialogOtros] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState({
    openSB: false,
    vertical: "top",
    horizontal: "center",
    colorSB: "dark",
    tipoCertificado: "",
  });
  const { vertical, horizontal, openSB, colorSB, tipoCertificado } =
    snackbarOpen;

  const handleChangeTabUso = (event, newValue) => {
    setValueTabUso(newValue);
  };

  const handleChangeTabOtros = (event, newValue) => {
    setValueTabOtros(newValue);
  };

  const handleChangeIndexUso = (index) => {
    setValueTabUso(index);
  };

  const showDialogUso = () => setOpenDialogUso(true);
  const showDialogOtros = () => setOpenDialogOtros(true);
  const showDialogCertificados = () => setOpenCertificados(true);

  const handleCloseDialogUso = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenDialogUso(false);
  };

  const handleCloseDialogOtros = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenDialogOtros(false);
  };

  const handleCloseCertificados = () => {
    setOpenCertificados(false);
  };

  const openMensaje = (newState) => () => {
    console.log(newState);
    let color;
    if (!predioLocalizado) {
      color = "dark";
      setMensajeConsulta(
        "Señor(a) Usuario(a), consulte un predio antes de generar el certificado."
      );

      setSnackbarOpen({ openSB: true, colorSB: color, ...newState });
    } else {
      showDialogCertificados();
      // color = 'light';
      // setMensajeConsulta("Interfaz generación de certificados en construcción..");
      // if(newState.tipoCertificado === 'usos'){
      // 	showDialogUso();
      // }
      // else{
      // 	showDialogOtros();
      // }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen({ ...snackbarOpen, openSB: false });
  };

  useEffect(() => {
    // Cargar los módulos de ArcGIS y crear el mapa
    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/WebMap",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
        "esri/core/reactiveUtils",
        "esri/core/promiseUtils",
        "esri/rest/query",
        "esri/rest/support/Query",
        "esri/widgets/LayerList",
        "esri/widgets/Expand",
        "esri/layers/ImageryLayer",
				"esri/rest/geoprocessor",
      ],
      { css: true }
    )
      .then(
        ([
          Map,
          MapView,
          WebMap,
          FeatureLayer,
          Graphic,
          reactiveUtils,
          promiseUtils,
          query,
          Query,
          LayerList,
          Expand,
          ImageryLayer,
					geoprocessor,
        ]) => {
          function getFeatureLayer(title, service, opacity, visible) {
            const feat_layer = new FeatureLayer({
              title: title,
              url: service,
              opacity: opacity,
              visible: visible,
              //renderer: prediosRenderer
            });

            return feat_layer;
          }

          queryParamsPredio = new Query({
            returnGeometry: true,
            outFields: ["*"],
          });

          queryParamsDireccion = new Query({
            outFields: ["*"],
          });

          queryParamsBarrio = new Query({
            returnGeometry: true,
            outFields: ["*"],
          });

          queryConsultaPredio = query;
          queryConsultaDireccion = query;
          queryConsultaBarrio = query;
          queryConsultaUsos = query;

          const fillSymbol = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: [255, 255, 255, 0.2],
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: [0, 102, 204],
              width: 2,
            },
          };

          polygonGraphic = new Graphic({
            symbol: fillSymbol,
          });

          const layer = new ImageryLayer({
            url: "https://enterprise.procalculo.com/arcgis/rest/services/geoprocesos/20230603_143943_59_24c7_3B_AnalyticMS_SR_8b_harmonized_clip_tif/ImageServer",
          });

          const map = new Map({
            basemap: "osm",
            layers: [layer],
          });

          const webmap = new WebMap({
            portalItem: {
              id: "8185c81346414784ba4e13aa8e815a8e",
            },
          });

          const overviewWebMap = new WebMap({
            portalItem: {
              id: "8185c81346414784ba4e13aa8e815a8e",
            },
          });

          const overviewMap = new Map({
            basemap: "osm",
          });

          document
            .getElementById("hotspotButton")
            .addEventListener("click", findHotspot);

          const message = document.getElementById("message");

          const gpUrl =
            "https://enterprise.procalculo.com/arcgis/rest/services/geoprocesos/TestGP3/GPServer/TestGP";

          //   webmap.when(function () {
          //     const feat_layer_usos = getFeatureLayer('Usos', constans.USOS_SERVICE, 0.8, false);

          //     feat_layer_usos.load().then(function () {
          //       webmap.layers.add(feat_layer_usos);
          //       webmap.layers.add(getFeatureLayer('Vías', constans.VIAS_SERVICE, 1, false));
          //       webmap.layers.add(
          //         getFeatureLayer('Manzanas', constans.MANZANAS_SERVICE, 0.8, false),
          //       );
          //       webmap.layers.add(getFeatureLayer('Predios', constans.PREDIOS_SERVICE, 0.5, true));
          //     });
          //   });

					function findHotspot() {
						console.log('findHotspot');

						const params = {
							param0: "ppsa",
							param1: "procalculo",
							param2: "ppsa"
						};
	
						// clean up previous results
						// cleanup();
						// geoprocessor submitJob, returns a JobInfo object
						geoprocessor
							.submitJob(gpUrl)
							.then((jobInfo) => {
								const options = {
									statusCallback: (jobInfo1) => {
										progTest(jobInfo1);
									}
								};
								// once the job completes, add resulting layer to map
								jobInfo.waitForJobCompletion(options).then((jobInfo2) => {
									drawResultData(jobInfo2);
								});
							})
							.catch((error) => {
								message.innerText = `Failed to successfully submitJob:\n
								${error}`;
							});
					}

					function drawResultData(result) {
						// add wait message
						message.innerText += "Análisis completo...\n";
						message.innerText += result.jobId;
	
						console.log(result);

						result.fetchResultData("msg_resultado").then((data) => {
							console.log(data);

							message.innerText += "\n\n";
							message.innerText += "Resultado del análisis: ";
							message.innerText += "\n\n";
							message.innerText += data.value;
						});

						result.fetchResultData("url_shapefile").then((data) => {
							console.log(data);
						});
					}
	
					function progTest(value) {
						console.log("Job status: " + "'" + value.jobStatus + "'");
						message.innerText += "Job status: " + "'" + value.jobStatus + "'\n";
					}
	
					function errBack(error) {
						message.innerText = "";
					}

          const view = new MapView({
            container: "mapContainer",
            map: map,
            zoom: 6,
            center: [-74.297333, 4.570868], // Coordenadas de Barranquilla X,Y
          });

          view.when(() => {
            const layerList = new LayerList({
              view: view,
              listItemCreatedFunction: (event) => {
                const item = event.item;
                console.log(item);

                if (item.title.includes("Mapa")) {
                  item.layer.listMode = "hide";
                }

                if (item.layer.type != "group") {
                  // don't show legend twice
                  item.panel = {
                    content: "legend",
                    open: true,
                  };
                }
              },
            });

            const bgExpand = new Expand({
              view,
              content: layerList,
              expandTooltip: "Capas",
              expandIconClass: "esri-icon-layers",
            });
            view.ui.add(bgExpand, "top-left");
          });

          viewMap = view;

          const mapOverView = new MapView({
            container: "overviewDiv",
            map: overviewMap,
            constraints: {
              rotationEnabled: false,
            },
          });

          //view.ui.move(['zoom'], 'top-right');
          mapOverView.ui.components = [];

          mapOverView.when(() => {
            view.when(() => {
              loadOverview();
            });
          });

          const extentDebouncer = promiseUtils.debounce(async () => {
            console.log(view.stationary);
            if (!view.stationary) {
              mapOverView.goTo({
                center: view.center,
                scale:
                  view.scale *
                  1 *
                  Math.max(
                    view.width / mapOverView.width,
                    view.height / mapOverView.height
                  ),
              });
            }
          });

          function loadOverview() {
            const extent3Dgraphic = new Graphic({
              geometry: null,
              symbol: {
                type: "simple-fill",
                color: [0, 0, 0, 0.5],
                outline: null,
              },
            });
            mapOverView.graphics.add(extent3Dgraphic);

            reactiveUtils.watch(
              () => view.extent,
              (extent) => {
                // Sync the overview map location
                // whenever the 3d view is stationary
                extentDebouncer().then(() => {
                  extent3Dgraphic.geometry = extent;
                });
              },
              {
                initial: true,
              }
            );
          }

          setMap(map);
          setView(view);
        }
      )
      .catch((error) => {
        console.error("Error al cargar los módulos de ArcGIS", error);
      });
  }, []);

  useEffect(() => {
    if (view) {
      // Ejemplo: Mostrar Snackbar cuando el usuario hace clic en el mapa
      const clickHandler = view.on("click", (event) => {
        const point = event.mapPoint;

        //setSnackbarOpen(true);
      });

      return () => {
        // Eliminar el observador de clic al desmontar el componente
        clickHandler.remove();
      };
    }
  }, [view]);

  return (
    <div>
      <div
        id="mapContainer"
        style={{ width: "100%", minHeight: "calc(90vh - 38px)", padding: 0 }}
      >
<div id="sidebar" class="esri-widget">
        <div id="text">
          <div id="info">
						<div style={{ paddingTop: 20 }}>
              <label class="label"><strong>&nbsp;&nbsp;&nbsp;Empezar Monitoreo:</strong></label><br />
            </div>
            <div align="center" style={{ paddingTop: 20 }}>
              <br />
              <button id="hotspotButton" class="esri-widget">
                Iniciar Análisis..
              </button>
            </div>
            <div style={{ paddingBottom: 20, paddingLeft: 10 }}>
              <br />
              <br />
              <label id="message" class="label"></label>
            </div>
            <div id="legendDiv" class="esri-widget"></div>
          </div>
        </div>
      </div>
			</div>
      <div id="overviewDiv" hidden={true}>
        <div id="extentDiv"></div>
      </div>
			{/* <div id="paneDiv" class="esri-widget">
      Click on map to execute ViewShed geoprocessor
    </div> */}
      
    </div>
  );
};

export default MapaComponente;

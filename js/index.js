var mapContainer = $("#map")[0];
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";
let map, cities;
let cityCount = 0;
const params = {
  //2f5667655dbf20203376e75c1b0dba8d <- my original api key
  appid: "4eedfeb184dc7cb08af6c0bd529c48b9", // 4eedfeb184dc7cb08af6c0bd529c48b9
  units: "metric", // for degrees C
  lang: "kr",
};
function mapInit() {
  var options = {
    center: new kakao.maps.LatLng(37.56826, 126.977829),
    level: 13, // 13 is max (=outermost covering largest area in map)
    // draggable: false,
    // zoomable: false,
    // disableDoubleclick: true,
  };

  map = new kakao.maps.Map(mapContainer, options);
  axios
    .get("./json/cities.json")
    .then(onGetCity)
    .catch((error) => {
      console.error(error.message);
    });
}

function onGetCity(response) {
  cities = response.data.cities;
  cities.forEach((city, index) => {
    //console.log(city.name, index); //서울 0 인천 1 부산 2
    params.lat = city.lat;
    params.lon = city.lon;
    params.id = city.id; // this becomes response.data.id in onCreateMarker
    //console.log("params:", params);

    // {params}, NOT params! <- why?
    axios.get(weatherApiUrl, { params }).then(onCreateMarker);
  });
}

function onCreateMarker(response) {
  // 커스텀 오버레이를 생성합니다
  console.log(response.data);
  cityCount++;

  // to get korean names for cities
  let city = cities.filter(function (city) {
    return city.id === response.data.id; // just one city evaluated
  });
  console.log(city);

  let content = `<div class="layer">
  <div><img src="https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png"/></div>
  <div>${response.data.name}/${city[0].name}</div>
  <div>Weather: ${response.data.weather[0].main}</div>
  <div>${response.data.main.temp} degrees</div>`;
  let position = new kakao.maps.LatLng(
    response.data.coord.lat,
    response.data.coord.lon
  );
  console.log("cityCount:", cityCount);

  var customOverlay = new kakao.maps.CustomOverlay({
    position,
    content,
  });

  // 커스텀 오버레이를 지도에 표시합니다
  customOverlay.setMap(map);
}

mapInit();

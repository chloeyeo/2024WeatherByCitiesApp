var mapContainer = $("#map")[0];
var myMapContainer = $("#myMap")[0];
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather";
let map, cities, myLatitude, myLongitude, myMap;
let cityCount = 0;
const params = {
  //2f5667655dbf20203376e75c1b0dba8d <- my original api key
  appid: "4eedfeb184dc7cb08af6c0bd529c48b9", // 4eedfeb184dc7cb08af6c0bd529c48b9
  units: "metric", // for degrees C
  lang: "en",
};
function mapInit() {
  var options = {
    center: new kakao.maps.LatLng(37.56826, 126.977829),
    level: 13, // 13 is max (=outermost covering largest area in map)
    draggable: false,
    // zoomable: false,
    // disableDoubleclick: true,
  };

  map = new kakao.maps.Map(mapContainer, options); //지도 생성 및 객체 리턴
  axios
    .get("./json/cities.json")
    .then(onGetCity)
    .catch((error) => {
      console.error(error.message);
    });
}

function myMapInit() {
  var options = {
    center: new kakao.maps.LatLng(myLatitude, myLongitude),
    level: 13, // 13 is max (=outermost covering largest area in map)
    draggable: false,
    // zoomable: false,
    // disableDoubleclick: true,
  };

  myMap = new kakao.maps.Map(myMapContainer, options); //지도 생성 및 객체 리턴
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
  console.log("response.data:", response.data);
  cityCount++;

  // to get korean names for cities
  let city = cities.filter(function (city) {
    return city.id === response.data.id; // just one city evaluated
  });
  console.log("city:", city);

  let content = `<div class="layer">
  <div><img src="https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png"/></div>
  <div>${response.data.name}/${city[0].name}</div>
  <div>Weather: ${response.data.weather[0].main}</div>
  <div>${response.data.main.temp} degrees</div>
  <div>Humidity: ${response.data.main.humidity}%</div>
  `;
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

function success(position) {
  myLatitude = position.coords.latitude;
  myLongitude = position.coords.longitude;
  console.log("my position successfully found");
  myMapInit();
}

function error() {
  alert("Cannot find your geolocation");
}

$(".tabmenu>li").click(function () {
  const currInd = $(this).index(); // i.e. this selected li's index inside tab menu
  $(".tabmenu>li").removeClass("active");
  $(this).addClass("active"); // add class to this clicked li only

  $(".content>div").hide();
  $(".content>div").eq(currInd).show();
  console.log("div id:", $(".content>div").eq(currInd).attr("id"));
});

/* The Navigator.geolocation read-only property returns a Geolocation
    object that gives Web content access to the location of the device*/
if (!navigator.geolocation) {
  alert("Geolocation not supported by your browser");
} else {
  navigator.geolocation.getCurrentPosition(success, error);
}

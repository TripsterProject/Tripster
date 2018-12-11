mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW4tYSIsImEiOiJjam5uZjE4MTAwaHpkM3FubnEzZDB4aHNyIn0.D1UhaVqcQeSRKmCZzUwa_w';
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

var poljeTock = [];

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/meresophisticated/cjo35mit8cmnk2rpe8gsrp8ck',
  center: [14.506738, 46.043781],
  zoom: 11.5
});

map.on('load', function(e) {
  map.addSource('places', {
    type: 'geojson',
    data: restavracije
  });
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    bbox: [13.6981099789, 45.4523163926, 16.5648083839, 46.8523859727]
  });

  map.addControl(geocoder, 'top-left');
  map.addSource('single-point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'point',
    source: 'single-point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf',
      'circle-stroke-width': 3,
      'circle-stroke-color': '#fff'
    }
  });

  geocoder.on('result', function(ev) {
    var rezultat = ev.result.geometry;
    map.getSource('single-point').setData(rezultat);
    var opcije = { units: 'kilometers' };
    restavracije.features.forEach(function(restavracija, index) {
      Object.defineProperty(restavracija.properties, 'distance', {
        value: turf.distance(rezultat, restavracija.geometry, opcije),
        writable: true,
        enumerable: true,
        configurable: true
      });
      if(restavracija.properties.distance>4)
      {
        poljeTock[index].style.visibility="hidden";
      }else{
        poljeTock[index].style.visibility="visible";
      }

    });
    //window.alert("Konec");
    //ustvari();
  });

});

function ustvariPopUp(trenutna) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0])
  {
    popUps[0].remove();
  }
  if (trenutna.properties.distance){
    var popup = new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(trenutna.geometry.coordinates)
    .setHTML('<h3>'+trenutna.properties.naziv+'</h3>' +
      '<p> <b>' + trenutna.properties.tip + '</b> <br/>' +
       trenutna.properties.naslov + '<br/>' +
      'Odprto: ' + trenutna.properties.odpre + ' - ' + trenutna.properties.zapre +
      '<br/> Razdalja: ' + trenutna.properties.distance  + ' km </p>')
    .addTo(map);
  }else{
    var popup = new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(trenutna.geometry.coordinates)
    .setHTML('<h3>'+trenutna.properties.naziv+'</h3>' +
      '<p> <b>' + trenutna.properties.tip + '</b> <br/>' +
       trenutna.properties.naslov + '<br/>' +
      'Odprto: ' + trenutna.properties.odpre + ' - ' + trenutna.properties.zapre + '</p>')
    .addTo(map);
  }
}

restavracije.features.forEach(function(marker) {
  //window.alert(marker.properties.distance);
  var element = document.createElement('div');
  switch (marker.properties.tip) {
    case "Pizzerija":
      element.className = 'RMarkerP';
      break;
    case "Gostilna":
      element.className = 'RMarkerG';
      break;
    case "Restavracija":
      element.className = 'RMarkerR';
      break;
    default:
    element.className = 'RMarker';

  }

  poljeTock.push(element);
  new mapboxgl.Marker(element, { offset: [0, -23] })
    .setLngLat(marker.geometry.coordinates)
    .addTo(map);
  element.addEventListener('click', function(e) {
    var aktivni = document.getElementsByClassName('active');
    ustvariPopUp(marker);
    e.stopPropagation();
    if (aktivni[0]) {
      aktivni[0].classList.remove('active');
    }
    var listing = document.getElementById('listing-' + i);
    console.log(listing);
    listing.classList.add('active');
  });
})

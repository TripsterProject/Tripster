mapboxgl.accessToken = 'pk.eyJ1IjoidXJiYW4tYSIsImEiOiJjam5uZjE4MTAwaHpkM3FubnEzZDB4aHNyIn0.D1UhaVqcQeSRKmCZzUwa_w';
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

var poljeTock = [];
var carLocation = [14.505548,46.056487];
var startingLocation = [14.505548,46.056487];
var lastAtRestaurant = 0;
var keepTrack = [];
var currentRoute = null;
var pointHopper = {};
var dropoffs = turf.featureCollection([]);
var nothing = turf.featureCollection([]);
var warehouse = turf.featureCollection([turf.point(startingLocation)]);
var opcije = { units: 'kilometers' };

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  center: carLocation,
  zoom: 11.5
});

map.on('load', function(e) {
  map.addSource('places', {
    type: 'geojson',
    data: restavracije
  });
  /*var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    bbox: [13.6981099789, 45.4523163926, 16.5648083839, 46.8523859727]
  });*/
  var markerT = document.createElement('div');
  markerT.classList = 'startingPoint';

  // Create a new marker
  truckMarker = new mapboxgl.Marker(markerT)
    .setLngLat(carLocation)
    .addTo(map);

    // Create a circle layer
    map.addLayer({
      id: 'warehouse',
      type: 'circle',
      source: {
        data: warehouse,
        type: 'geojson'
      },
      paint: {
        'circle-radius': 20,
        'circle-color': 'white',
        'circle-stroke-color': '#3887be',
        'circle-stroke-width': 3
      }
    });

    map.addLayer({
      id: 'warehouse-symbol',
      type: 'symbol',
      source: {
        data: warehouse,
        type: 'geojson'
      },
      layout: {
        'icon-image': 'grocery-15',
        'icon-size': 1
      },
      paint: {
        'text-color': '#3887be'
      }
    });

    map.addLayer({
      id: 'dropoffs-symbol',
      type: 'symbol',
      source: {
        data: dropoffs,
        type: 'geojson'
      },
      layout: {
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
        'icon-image': 'marker-15',
      }
    });

    map.on('click', function(e) {
      // When the map is clicked, add a new drop-off point
      // and update the `dropoffs-symbol` layer
      newDropoff(map.unproject(e.point));
      updateDropoffs(dropoffs);
    });
    map.addSource('route', {
      type: 'geojson',
      data: nothing
    });

    map.addLayer({
      id: 'routeline-active',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': {
          base: 1,
          stops: [
            [12, 3],
            [22, 12]
          ]
        }
      }
    }, 'waterway-label');

    map.addLayer({
    id: 'routearrows',
    type: 'symbol',
    source: 'route',
    layout: {
      'symbol-placement': 'line',
      'text-field': '▶',
      'text-size': {
        base: 1,
        stops: [[12, 24], [22, 60]]
      },
      'symbol-spacing': {
        base: 1,
        stops: [[12, 30], [22, 160]]
      },
      'text-keep-upright': false
    },
    paint: {
      'text-color': '#3887be',
      'text-halo-color': 'hsl(55, 11%, 96%)',
      'text-halo-width': 3
    }
    }, 'waterway-label');

  /*map.addControl(geocoder, 'top-left');
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
  });*/

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
      '<br/> Razdalja: ' + trenutna.properties.distance  + ' km </p>'+
      '<button type="button" class="dodaj">Dodaj</button>')
    .addTo(map);
  }else{
    var popup = new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(trenutna.geometry.coordinates)
    .setHTML('<h3>'+trenutna.properties.naziv+'</h3>' +
      '<p> <b>' + trenutna.properties.tip + '</b> <br/>' +
       trenutna.properties.naslov + '<br/>' +
      'Odprto: ' + trenutna.properties.odpre + ' - ' + trenutna.properties.zapre + '</p>' +
       '<button type="button" class="dodaj">Dodaj</button>')
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
  });
})


//to maybe prestavi pred map on load
function newDropoff(coords) {
  // Store the clicked point as a new GeoJSON feature with
  // two properties: `orderTime` and `key`
  var tocka = turf.point(
    [coords.lng, coords.lat], {
      orderTime: Date.now(),
      key: Math.random()
    }
  );
  dropoffs.features.push(tocka);
  pointHopper[tocka.properties.key] = tocka;

  // Make a request to the Optimization API
  $.ajax({
    method: 'GET',
    url: assembleQueryURL(),
  }).done(function(data) {
    // Create a GeoJSON feature collection
    var routeGeoJSON = turf.featureCollection([turf.feature(data.trips[0].geometry)]);

    // If there is no route provided, reset
    if (!data.trips[0]) {
      routeGeoJSON = nothing;
    } else {
      // Update the `route` source by getting the route source
      // and setting the data equal to routeGeoJSON
      map.getSource('route')
        .setData(routeGeoJSON);
    }
    //console.log(JSON.stringify(routeGeoJSON));
    var koordinatePoti=routeGeoJSON.features[0].geometry;
    poljeTock.forEach(function(e){
      e.style.visibility="hidden";
    });
    //izpis vseh razd
    /*
    koordinatePoti.coordinates.forEach(function(e, index1){
      console.log(turf.distance(e, eprej, opcije)*1000+ " metrov");
      eprej=e;
    });*/
    //izpis vseh koordinat
    /*var prejsnja=0, razdalja=1;
    var eprej=koordinatePoti.coordinates[0], maxRazdalja=0.0002;
    maxRazdalja+=0.0002*Math.floor(koordinatePoti.coordinates.length/1000);
    console.log(maxRazdalja);
    koordinatePoti.coordinates.forEach(function(e, index1){
      if(razdalja==0)
      {
        razdalja=Math.abs((e[0]+e[1])-prejsnja);
      }
      if(razdalja>maxRazdalja)
      {
        console.log(index1+" "+JSON.stringify(e)+ " " + razdalja);
        console.log(turf.distance(e, eprej, opcije)*1000+ " metrov");
        razdalja=0;
        eprej=e;
      }else {
        razdalja+=Math.abs((e[0]+e[1])-prejsnja);
        //console.log(index1+" premalo " + razdalja);
      }
      prejsnja=e[0]+e[1];
    });*/
    restavracije.features.forEach(function(restavracija, index) {
      var prejsnja=0, razlika=1, razdalja=0, maxRazdalja=0.0002;
      maxRazdalja+=0.0002*Math.floor(koordinatePoti.coordinates.length/1000);
      console.log(maxRazdalja);
      koordinatePoti.coordinates.forEach(function(e, index1){
        if(razlika==0)
        {
          razlika=Math.abs((e[0]+e[1])-prejsnja);
        }
        if(razlika>maxRazdalja)
        {
          razdalja=turf.distance(e, restavracija.geometry, opcije);
          if(restavracija.properties.distance)
          {
            if(razdalja<restavracija.properties.distance)
            {
              console.log(index+ " " + restavracija.properties.distance + " km --> " + razdalja + " km");
              restavracija.properties.distance=razdalja;
            }
          }else{
            Object.defineProperty(restavracija.properties, 'distance', {
            value: turf.distance(e, restavracija.geometry, opcije),
            writable: true,
            enumerable: true,
            configurable: true
            });
          }
          if(restavracija.properties.distance<4)
          {
            //console.log(index+ " " + restavracija.properties.distance + " metrov");
            poljeTock[index].style.visibility="visible";
          }
          //console.log(index+ " " + turf.distance(e, eprej, opcije)*1000+ " metrov");
          razlika=0;
          //eprej=e;
          //if(restavracija.properties.distance)
        }else {
          razlika+=Math.abs((e[0]+e[1])-prejsnja);
          //console.log(index1+" premalo " + razdalja);
        }
        prejsnja=e[0]+e[1];
        //console.log(JSON.stringify(e));
      });
    });

    if (data.waypoints.length === 12) {
      window.alert('Maximum number of points reached. Read more at mapbox.com/api-documentation/#optimization.');
    }
  });
}

function updateDropoffs(geojson) {
  map.getSource('dropoffs-symbol')
    .setData(geojson);
}


function assembleQueryURL() {
  // Store the location of the truck in a variable called coordinates
  var coordinates = [carLocation];
  var distributions = [];
  keepTrack = [carLocation];

  // Create an array of GeoJSON feature collections for each point
  var restJobs = objectToArray(pointHopper);

  // If there are actually orders from this restaurant
  if (restJobs.length > 0) {

    // Check to see if the request was made after visiting the restaurant
    var needToPickUp = restJobs.filter(function(d, i) {
      return d.properties.orderTime > lastAtRestaurant;
    }).length > 0;

    // If the request was made after picking up from the restaurant,
    // Add the restaurant as an additional stop
    if (needToPickUp) {
      var restaurantIndex = coordinates.length;
      // Add the restaurant as a coordinate
      coordinates.push(startingLocation);
      // push the restaurant itself into the array
      keepTrack.push(pointHopper.warehouse);
    }

    restJobs.forEach(function(d, i) {
      // Add dropoff to list
      keepTrack.push(d);
      coordinates.push(d.geometry.coordinates);
      // if order not yet picked up, add a reroute
      if (needToPickUp && d.properties.orderTime > lastAtRestaurant) {
        distributions.push(restaurantIndex + ',' + (coordinates.length - 1));
      }
    });
  }

  // Set the profile to `driving`
  // Coordinates will include the current location of the truck,
  return 'https://api.mapbox.com/optimized-trips/v1/mapbox/driving/' + coordinates.join(';') + '?distributions=' + distributions.join(';') + '&overview=full&steps=true&geometries=geojson&source=first&access_token=' + mapboxgl.accessToken;
}

function objectToArray(obj) {
  var keys = Object.keys(obj);
  var routeGeoJSON = keys.map(function(key) {
    return obj[key];
  });
  return routeGeoJSON;
}

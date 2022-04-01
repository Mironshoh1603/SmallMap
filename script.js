'use strict';

let way, masofa;
// prettier-ignore
var redIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
var marker;
var greenIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputForm = document.querySelector('.input_again');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputSpeed = document.querySelector('.form__input--speed');
const inputElevation = document.querySelector('.form__input--elevation');

let latitude;
let longitude;
let redlat, redlong, greenlat, greenlong;
let map;
let eventMap;

class Athlete {
  date = new Date();
  id = (Date.now() + '').slice(-8);
  constructor(distance, duration, fromCoords, toCoords) {
    this.distance = distance;
    this.duration = duration;
    this.fromCoords = fromCoords;
    this.toCoords = toCoords;
  }
  _setTavsif() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.malumot = `${this.type[0].toUpperCase()}${this.type.slice(1)}
    ${months[this.date.getMonth()]}${this.date.getDate()}
    `;
  }
}

class Runner extends Athlete {
  type = 'running';
  constructor(distance, duration, fromCoords, toCoords, cadence) {
    super(distance, duration, fromCoords, toCoords);
    this.cadence = cadence;
    this._setTavsif();
  }
}
class Cycling extends Athlete {
  type = 'cycling';

  constructor(distance, duration, fromCoords, toCoords, elevation) {
    super(distance, duration, fromCoords, toCoords);
    this.elevation = elevation;
    this._setTavsif();
  }
}
class Driving extends Athlete {
  type = 'driving';
  constructor(distance, duration, fromCoords, toCoords, speed) {
    super(distance, duration, fromCoords, toCoords);
    this.speed = speed;
    this._setTavsif();
  }
}

class MapApp {
  step = 0;
  #database = [];
  constructor() {
    this._getCurrentMapPosition();
    inputType.addEventListener('change', this._selectMapToggle);
    document.addEventListener('keydown', this._enterPress.bind(this));
    form.addEventListener('submit', this._createObject.bind(this));
  }

  _getCurrentMapPosition() {
    navigator.geolocation.getCurrentPosition(
      this._showPosition.bind(this),
      function () {
        alert('Lokatsiyani topa olmadim');
      }
    );
  }
  _showPosition(e) {
    latitude = e.coords.latitude;
    longitude = e.coords.longitude;

    map = L.map('map').setView([latitude, longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
  }
  _showForm() {
    form.classList.remove('hidden');
  }
  _selectMapToggle() {
    if (inputType.value === 'cycling') {
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      inputSpeed.closest('.form__row').classList.add('form__row--hidden');
      inputElevation
        .closest('.form__row')
        .classList.remove('form__row--hidden');
    } else if (inputType.value === 'running') {
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
      inputSpeed.closest('.form__row').classList.add('form__row--hidden');
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
    } else if (inputType.value === 'driving') {
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      inputSpeed.closest('.form__row').classList.remove('form__row--hidden');
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
    }
  }

  _enterPress(e) {
    if (e.code === 'Enter') {
      if (this.step == 0) {
        this.step++;
        document
          .querySelector('.popup-navigation')
          .classList.add('hidden_popup');
        document.querySelector('.popup-red').classList.remove('hidden_popup');
        this._setMapDragbleTrueMarker(latitude, longitude, redIcon);
      } else if (this.step == 1) {
        map.removeLayer(marker);
        this._setMapDragbleFalseMarker(latitude, longitude, redIcon);
        this.step++;
        redlat = latitude;
        redlong = longitude;
        console.log(redlat, redlong);

        document.querySelector('.popup-red').classList.add('hidden_popup');
        this._setMapDragbleTrueMarker(
          (latitude -= 0.001),
          (longitude -= 0.005),
          greenIcon
        );
      } else if (this.step == 2) {
        this.step++;
        map.removeLayer(marker);

        this._setMapDragbleFalseMarker(latitude, longitude, greenIcon);
        greenlat = latitude;
        greenlong = longitude;
        way = L.Routing.control({
          createMarker: function () {
            return null;
          },
          waypoints: [L.latLng(redlat, redlong), L.latLng(greenlat, greenlong)],

          lineOptions: {
            styles: [
              {
                color: 'darkblue',
                opacity: 1,
                wight: 5,
              },
            ],
          },
        }).addTo(map);
        way.on('routesfound', function (e) {
          masofa = e.routes[0].summary.totalDistance;
        });
        this._showForm();
      }
    } else if (e.code == 'Escape') {
      if (this.step == 1) {
        this.step--;
        document
          .querySelector('.popup-navigation')
          .classList.remove('hidden_popup');
      }
    }
  }

  _createObject(e) {
    e.preventDefault();
    let sporter;
    let numbermi = (...inputs) => {
      return inputs.every(val => Number.isFinite(val));
    };
    let musbatmi = (...inputs) => {
      return inputs.every(val => val > 0);
    };
    console.log(masofa);
    if (inputType.value === 'running') {
      let cadence = inputCadence.value;
      console.log(cadence);
      if (!numbermi(masofa, cadence) && !musbatmi(masofa, cadence)) {
        return 'Error!';
      }
      sporter = new Runner(
        masofa,
        masofa / cadence,
        [redlat, redlong],
        [greenlat, greenlong],
        cadence
      );
    } else if (inputType.value === 'cycling') {
      let elevation = inputElevation.value;
      console.log(elevation);
      if (!numbermi(masofa, elevation) && !musbatmi(masofa, elevation)) {
        return 'Error!';
      }
      sporter = new Cycling(
        masofa,
        masofa / elevation,
        [redlat, redlong],
        [greenlat, greenlong],
        elevation
      );
    } else if (inputType.value === 'driving') {
      let speed = inputSpeed.value;
      console.log(elevation);
      if (!numbermi(masofa, speed) && !musbatmi(masofa, speed)) {
        return 'Error!';
      }
      sporter = new Driving(
        masofa,
        masofa / speed,
        [redlat, redlong],
        [greenlat, greenlong],
        speed
      );
    }
    this._renderList(sporter);
    this.#database.push(sporter);
    console.log(this.#database);

    this.step = 0;
    document.querySelector('.leaflet-routing-container').style.visibility =
      'hidden';
    this._hideForm();
    this._setLocalStorage();
  }
  _hideForm() {
    inputCadence.value = inputElevation.value = inputSpeed.value = '';
    form.classList.add('hidden');
  }

  _setMapDragbleTrueMarker(lat, long, icon) {
    marker = L.marker([lat, long], { icon: icon, draggable: 'true' })
      .on('move', function (e) {
        latitude = e.latlng.lat;
        longitude = e.latlng.lng;
      })
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
        }).setContent(`Belgilangan Joy`)
      )
      .openPopup();
  }
  _renderList(obj) {
    let html = `   
         <li class="workout workout--${obj.type}" data-id="${obj.id}">
          <h2 class="workout__title">${obj.malumot}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              obj.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${obj.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${obj.duration}</span>
            <span class="workout__unit">min</span>
          </div> `;

    // if (obj.type === 'running') {
    //   html += `
    //         <div class="workout__details">
    //         <span class="workout__icon">⚡️</span>
    //         <span class="workout__value">${obj.distance / obj.duration}</span>
    //         <span class="workout__unit">min/km</span>
    //       </div>
    //       <div class="workout__details">
    //         <span class="workout__icon">🦶🏼</span>
    //         <span class="workout__value">${obj.cadence}</span>
    //         <span class="workout__unit">spm</span>
    //       </div>
    //     </li>`;
    // } else {
    //   html += `
    //         <div class="workout__details">
    //         <span class="workout__icon">⚡️</span>
    //         <span class="workout__value">${
    //           obj.distance / (obj.duration / 60)
    //         }</span>
    //         <span class="workout__unit">km/h</span>
    //       </div>
    //       <div class="workout__details">
    //         <span class="workout__icon">⛰</span>
    //         <span class="workout__value">${obj.elevation}</span>
    //         <span class="workout__unit">m</span>
    //       </div>`;
    // }

    form.insertAdjacentHTML('afterend', html);
  }
  _setLocalStorage() {
    localStorage.setItem('mashqlar', JSON.stringify(this.#database));
  }

  // malumotlarni localStorage dan olish
  _getLocalStorage() {
    let data = JSON.parse(localStorage.getItem('mashqlar'));
    if (!data) return;

    this.#database = data;
    console.log(data);
    this.#database.forEach(val => {
      this._setMarker(val);
      this._renderList(val);
    });
  }

  removeLocalStorage() {
    localStorage.removeItem('mashqlar');
    location.reload();
  }
  _setMapDragbleFalseMarker(lat, long, icon) {
    L.marker([lat, long], { icon: icon })
      .on('move', function (e) {
        latitude = e.latlng.lat;
        longitude = e.latlng.lng;
      })
      .addTo(map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `running-popup`,
        }).setContent(`Belgilangan Joy`)
      )
      .openPopup();
  }
}

const WorkMap = new MapApp();

# Swiss Orienteering Events
This project contains a simple Vue.js app with a table of orienteering events in switzerland. 
The table provides filters for almost all fields and an overall search. The project is optimized
for mobile and desktop usage.

### Licence
The source code is released under the GNU General Public License.

### Data Source
Currently, the app works only with a json file. The swiss orienteering federation provides a
list with all events under https://www.o-l.ch/cgi-bin/fixtures. There is also a CSV-Export
on which this app builds on. It is necessary to convert the CSV data to a JSON file for importing
the data.


## Project setup
The project uses [Vue.js](https://vuejs.org/) as a frontend framework and [PrimeVue](https://www.primefaces.org/primevue/) as a UI-Library.
To install all dependencies run
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```
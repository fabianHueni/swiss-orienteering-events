<template>
  <div>
    <div class="card">
      <DataTable :value="events" :rows="50"
                 :paginator="!isSmallScreen()" :rowsPerPageOptions="[10,20,50, 100, 200]"
                 paginatorTemplate="CurrentPageReport PrevPageLink PageLinks NextPageLink RowsPerPageDropdown"
                 currentPageReportTemplate="{first} bis {last} von {totalRecords}"
                 responsiveLayout="scroll" :autoLayout="true"
                 dataKey="unique_id" v-model:filters="filters" :filterDisplay="isSmallScreen()? '': 'row'" :loading="loading"
                 :globalFilterFields="['date','region','event_name', 'club', 'map', 'location']"
                 :scrollable="true" scrollHeight="flex" v-model:selection="selectedEvents"
                 groupRowsBy="month" rowGroupMode="subheader" sortMode="single" sortField="date" :sortOrder="1">

        <template #header>
          <div class="flex flex-column md:flex-row align-items-center justify-content-between">
            <h2>Swiss Orienteering Events</h2>

            <div>
              <span class="p-input-icon-left ">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Suche" />
              </span>

              <Button icon="pi pi-filter" @click="openFilterModal" class="p-button-text ml-2" v-tooltip="'Filtern'"/>
            </div>

            <div v-if="!isSmallScreen()" class="flex align-items-center">
              <label class="mr-2">Events selektieren</label>
              <InputSwitch v-model="selectionModeOn"
                           v-tooltip="'Aktiviert die Auswahl von Events, um diese anschliessend in eine ics-Datei (Kalendereinträge) zu exportieren.'"/>
              <Button icon="pi pi-download" @click="exportEventsAsICal" class="p-button-text ml-2" :disabled="!selectionModeOn"
                      v-tooltip.bottom="'Lädt die ausgewählten Events als ics-Datei herunter. Du kannst die Datei anschliessend in deinen Kalender importieren.'" />
            </div>
          </div>
        </template>

        <template #empty>
          <div class="flex justify-content-center">
            <b>Keine passenden Events gefunden.</b>
          </div>
        </template>

        <template #loading>
          <div class="flex justify-content-center">
            <b>Die Events werden geladen.</b>
          </div>
        </template>

        <template #groupheader="slotProps">
          <b class="group-header-title">{{ slotProps.data.month }}</b>
        </template>

        <Column v-if="selectionModeOn" selectionMode="multiple" style="max-width: 50px"></Column>

        <Column field="date" header="Datum" dataType="date" :showClearButton="true" :showFilterMenu="false" :sortable="false" style="max-width: 200px; min-width: 150px">
          <template #body="{data}">
            {{ formatDate(data.date) }}
          </template>
          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <Calendar v-model="filterModel.value" @date-select="filterCallback()" :showButtonBar="true" :touchUI="isSmallScreen()" dateFormat="dd.mm.yy" placeholder="Events ab" />
          </template>
        </Column>

        <Column header="Region" filterField="region" :showFilterMenu="false" :showClearButton="false"  style="max-width: 135px; min-width: 100px">
          <template #body="{data}">
            <span>{{ data.region}}</span>
          </template>

          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="regions" placeholder="Alle" class="p-column-filter">
              <template #option="slotProps">
                <span >{{slotProps.option}}</span>
              </template>
            </MultiSelect>
          </template>
        </Column>

        <Column header="Bezeichnung" filterField="event_name" :showFilterMenu="false" :showClearButton="false" style="min-width: 200px">
          <template #body="{data}">
            <span>{{data.event_name}}</span>
          </template>
          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <InputText type="text" v-model="filterModel.value" @input="filterCallback()" class="p-column-filter" placeholder="Suche nach Name"/>
          </template>
        </Column>

        <Column header="Veranstalter" filterField="club" :showFilterMenu="false" :showClearButton="false" style="min-width: 200px">
          <template #body="{data}">
            <span >{{data.club}}</span>
          </template>
          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <InputText type="text" v-model="filterModel.value" @input="filterCallback()" class="p-column-filter" placeholder="Suche nach Veranstalter"/>
          </template>
        </Column>

        <Column header="Karte" filterField="map" :showFilterMenu="false" :showClearButton="false" style="min-width: 150px">
          <template #body="{data}">
            <span >{{data.map}}</span>
          </template>
          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <InputText type="text" v-model="filterModel.value" @input="filterCallback()" class="p-column-filter" placeholder="Suche nach Karte"/>
          </template>
        </Column>


        <Column header="Typ" filterField="kind" :showFilterMenu="false" :showClearButton="false" style="max-width: 150px; min-width: 100px">
          <template #body="{data}">
            <span>{{data.kind}}</span>
          </template>
          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <MultiSelect v-model="filterModel.value" @change="filterCallback()" :options="types" placeholder="Alle" class="p-column-filter">
              <template #option="slotProps">
                <span>{{slotProps.option}}</span>
              </template>
            </MultiSelect>
          </template>
        </Column>

        <Column field="day_night" header="Tag/Nacht" :showFilterMenu="false" :showClearButton="false" style="max-width: 150px; min-width: 100px">
          <template #body="{data}">
            <i v-if="data.day_night === 'Tag'" class="pi pi-sun" v-tooltip="'Tag'"></i>
            <i v-else class="pi pi-moon" v-tooltip="'Nacht-OL'"></i>
          </template>

          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="day_night" placeholder="Alle" class="p-column-filter" :showClear="true">
              <template #value="slotProps">
                <span v-if="slotProps.value">{{slotProps.value}}</span>
                <span v-else>{{slotProps.placeholder}}</span>
              </template>
              <template #option="slotProps">
                <i v-if="slotProps.option === 'Tag'" class="pi pi-sun" v-tooltip="'Tag'"></i>
                <i v-else class="pi pi-moon" v-tooltip="'Nacht-OL'"></i>
                <span class="pl-2">{{slotProps.option}}</span>
              </template>
            </Dropdown>
          </template>
        </Column>

        <Column field="national" header="Nationaler" :showFilterMenu="false" :showClearButton="false" style="max-width: 150px; min-width: 100px">
          <template #body="{data}">
            {{data.national}}
          </template>

          <template #filter="{filterModel,filterCallback}" v-if="!isSmallScreen()">
            <Dropdown v-model="filterModel.value" @change="filterCallback()" :options="national" placeholder="Alle" class="p-column-filter" :showClear="true">
              <template #value="slotProps">
                <span v-if="slotProps.value">{{slotProps.value}}</span>
                <span v-else>{{slotProps.placeholder}}</span>
              </template>
              <template #option="slotProps">
                <span>{{slotProps.option}}</span>
              </template>
            </Dropdown>
          </template>
        </Column>

        <Column field="deadline" header="Meldeschluss" dataType="date" style="max-width: 150px; min-width: 100px">
          <template #body="{data}">
            {{ formatDate(data.deadline) }}
          </template>
        </Column>

        <Column field="location" style="max-width: 50px">
          <template #body="{data}">
            <a v-if="data.coord_x !== '' && data.coord_y !== ''" :href="'https://map.geo.admin.ch/?E=' + data.coord_x + '&N=' + data.coord_y + '&zoom=8'"
               target="_blank" v-tooltip.left="'Ort auf Karte anzeigen'">
              <i class="pi pi-map"></i>
            </a>
          </template>
        </Column>

        <Column field="event_link"  style="max-width: 50px">
          <template #body="{data}">
            <a v-if="data.event_link !== ''" :href="data.event_link" target="_blank" v-tooltip.left="'Link zum Event'">
              <i class="pi pi-external-link"></i>
            </a>
          </template>
        </Column>

        <template #paginatorstart>
          <p class="text-xs hidden md:block">Developed by: <a class="text-color-secondary" href="https://www.linkedin.com/in/fabian-h%C3%BCni/" target="_blank">Fabian Hüni</a></p>
        </template>

        <template #paginatorend>
          <p class="text-xs hidden md:block">Datenquelle: <a href="https://www.o-l.ch/cgi-bin/fixtures" target="_blank">Swiss Orienteering (CSV-Export)</a></p>
        </template>
      </DataTable>

      <Dialog header="Filtern der Events" v-model:visible="displayModal" :maximizable="true" :closeOnEscape="true"
              :dismissableMask="true" :breakpoints="{'960px': '75vw', '640px': '90vw'}" :style="{width: '60vw'}" :modal="true">
        <div>

          <label for="date" class="block text-900 font-medium mb-2 mt-2">Events anzeigen ab</label>
          <Calendar class="w-full" id="date" v-model="filters['date'].value" dateFormat="dd.mm.yy" :showButtonBar="true" :touchUI="true" placeholder="Datum wählen"/>

          <label for="region" class="block text-900 font-medium mb-2 mt-2">Regionen einschränken</label>
          <SelectButton  class="w-full" id="region"  v-model="filters['region'].value" :options="regions" :multiple="true"/>

          <label for="event_name" class="block text-900 font-medium mb-2 mt-2">Bezeichnung</label>
          <InputText type="text" id="event_name" class="w-full" v-model="filters['event_name'].value" placeholder="Nach Name filtern" />

          <label for="club" class="block text-900 font-medium mb-2 mt-2">Veranstalter</label>
          <InputText type="text" id="club" class="w-full" v-model="filters['club'].value" placeholder="Nach Veranstalter filtern" />

          <label for="map" class="block text-900 font-medium mb-2 mt-2">Karte</label>
          <InputText type="text" id="map" class="w-full" v-model="filters['map'].value" placeholder="Nach Karte filtern"/>

          <label for="kind" class="block text-900 font-medium mb-2 mt-2">Typ</label>
          <SelectButton  class="w-full" id="kind"  v-model="filters['kind'].value" :options="types" :multiple="true"/>

          <label for="day_night" class="block text-900 font-medium mb-2 mt-2">Tag/Nacht</label>
          <SelectButton  class="w-full" id="day_night"  v-model="filters['day_night'].value" :options="day_night"/>

          <label for="national" class="block text-900 font-medium mb-2 mt-2">Nationale</label>
          <SelectButton  class="w-full" id="national"  v-model="filters['national'].value" :options="national" />

        </div>

        <template #footer>
          <Button label="Alle Filter löschen" icon="pi pi-times" @click="removeAllFilter()" class="p-button-text w-full md:w-5 lg:w-4  xl:w-3"/>
          <Button label="Resultat anzeigen" class="w-full md:w-5 lg:w-4 xl:w-3" icon="pi pi-check" @click="closeFilterModal()" autofocus />
        </template>
      </Dialog>

    </div>
  </div>
</template>

<script>
import EventService from '../services/EventService';
import {FilterMatchMode} from 'primevue/api';
import iCalendarService from "@/services/iCalendarService";

export default {
  name: 'EventTable',
  data() {
    return {
      events: null,
      selectedEvents: null,
      filters: {},
      defaultFilters: {
        'global': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'date': {value: null, matchMode: FilterMatchMode.DATE_AFTER},
        'region': {value: null, matchMode: FilterMatchMode.IN},
        'event_name': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'club': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'map': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'kind': {value: null, matchMode: FilterMatchMode.IN},
        'day_night': {value: null, matchMode: FilterMatchMode.EQUALS},
        'national': {value: null, matchMode: FilterMatchMode.EQUALS}
      },
      regions: [],
      types: [],
      national: ['Ja', 'Nein'],
      day_night: ['Tag', 'Nacht'],
      loading: true,
      displayModal: false,
      selectionModeOn: false
    }
  },
  created() {
    this.eventService = new EventService();
    this.iCalendarService = new iCalendarService();
    this.filters = this.defaultFilters;
  },
  mounted() {
    this.eventService.getEventsFromSwissOrienteering().then(data => {
      this.events = data.flat();
      console.log(data[0]);

      this.events.forEach(event => {
        event.date = this.parseStringToDate(event.date);
        event.month = this.getMonthYearFromDate(event.date);
        event.deadline = this.parseStringToDate(event.deadline);
        event.national = event.national === '1' ? 'Ja': 'Nein';
        event.day_night = event.day_night === 'day'? 'Tag': 'Nacht';
        event.kind = event.kind === 'ski'? 'Ski': (event.kind === 'bike'? 'Bike': "Fuss");
        event.region = event.region === '' ? '-': event.region;
      });

      this.events = this.events.filter((event) => event.date >= new Date(new Date().setDate(new Date().getDate()-7))).sort()

      this.regions = this.events.map((e) => e.region).filter((v, i, a) => a.indexOf(v) === i && v !== '-').sort();
      this.types = this.events.map((e) => e.kind).filter((v, i, a) => a.indexOf(v) === i).sort();

      this.loading = false;
    });
  },
  methods: {
    formatDate(value) {
      if (value === null) {
        return "-";
      }
      return value.toLocaleDateString('de', {
        weekday: "short",
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    parseStringToDate(dateString) {
      if (dateString === '') {
        return null;
      }
      const dateParts = dateString.split("-");
      return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    },
    getMonthYearFromDate(date) {
      return date.toLocaleString('de-ch', {
        month: 'long',
        year: 'numeric',
      });
    },
    isSmallScreen() {
      return window.innerHeight < 600 || window.innerWidth < 600;
    },
    openFilterModal() {
      this.displayModal = true;
    },
    closeFilterModal() {
      this.displayModal = false;
    },
    removeAllFilter() {
      this.displayModal = false;
      this.filters = this.defaultFilters;
    },
    exportEventsAsICal() {
      this.iCalendarService.generateICalFile(this.selectedEvents);
    },
  }
}
</script>

<style lang="scss" scoped>

.card {
  background: var(--surface-card)	;
  padding: 0 24px;
  height: calc(100vh - 2px);

  @media screen and (max-width: 600px) {
    padding: 0 6px;

    h2 {
      font-size: 1.4rem;
      margin-bottom: 12px !important;
    }
  }

  h2 {
    color: var(--text-color	);
    margin-top: 0;
    margin-bottom: 0;
  }

  a {
    color: var(--orange-400)
  }

}

.z-index-2000 {
  z-index: 2000!important;
}

::v-deep(.p-progressbar) {
  height: .5rem;
  background-color: #D8DADC;

  .p-progressbar-value {
    background-color: #607D8B;
  }
}

::v-deep(.p-datepicker) {
  min-width: 25rem;

  td {
    font-weight: 400;
  }
}

::v-deep(.p-datatable.p-datatable-customers) {
  .p-datatable-header {
    padding: 1rem;
    text-align: left;
    font-size: 1.5rem;
  }

  .p-paginator {
    padding: 1rem;
  }

  .p-datatable-thead > tr > th {
    text-align: left;
  }

  .p-datatable-tbody > tr > td {
    cursor: auto;
  }

  .p-dropdown-label:not(.p-placeholder) {
    text-transform: uppercase;
  }
}


</style>
<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
  <!-- <div class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center">
    <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div> -->
  <div class="container">
    <add-currency-block @add-new-currency="addNewCurrency"/>

    <hr class="w-full border-t border-gray-600 my-4" />
    <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div 
        v-for="currency in paginatedCurrencies" 
        :key="currency.name" 
        @click="selectCurrency(currency)" 
        :class="{'border-4': selectedCurrency == currency}"
        class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
      >
        <div class="px-4 py-5 sm:p-6 text-center">
          <dt class="text-sm font-medium text-gray-500 truncate">
            {{currency.name}} - USD
          </dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">
            {{ getFormatedPrice(currency.price) }}
          </dd>
        </div>
        <div class="w-full border-t border-gray-200"></div>
        <button
          @click.stop="removeCurrency(currency)"
          class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="#718096"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            ></path></svg>Remove
        </button>
      </div>
    </dl>
    <div><input v-model="filter" @input="page = 1"/></div>
    <div class="content-center">
      <button
        v-if="page > 1"
        :on-click="page = page -1"
        class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        Next
      </button>
      <button
        v-if="hasNextPage"
        :on-click="page = page +1" 
        class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
        Prev
      </button>
    </div>
    <hr class="w-full border-t border-gray-600 my-4"/>
    <graph-block
      :graph="graph"
      :mainCurrency="mainCurrency"
      :selectCurrency="selectedCurrency"
      @splice-graph="spliceGraph"
      ref="graphBlock"
    />
  </div>
</div>
</template>

<script>

import { subscribeToCurrency, unsubscribeCurrency } from  './api'
import AddCurrencyBlock from './components/AddCurrencyBlock.vue';
import GraphBlock from './components/GraphBlock.vue';

const PER_PAGE = 6;
const EX_ROUND = 2;

export default {
  name: 'App',
  components: {
    'add-currency-block': AddCurrencyBlock,
    'graph-block': GraphBlock
  },
  data() {
    return {
      currencies: [],
      mainCurrency: 'USD',
      selectedCurrency: null,
      graph: [],
      page: 1,
      filter: '',
    }
  },
  created() {
    const windowData = Object.fromEntries(new URL(window.location).searchParams.entries());
    if (windowData.filter) {
      this.filter = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }

    const currenciesData = localStorage.getItem('cryptonomicon-list');
    if (currenciesData) {
      this.currencies = JSON.parse(currenciesData);
      this.currencies.forEach(currency => {
        subscribeToCurrency(currency.name, newPrice => 
          this.updateCurrency(currency.name, newPrice)
        )
      });
    }
  },
  computed: {
    startIndex() {
      return (this.page - 1) * PER_PAGE;
    },
    endIndex() {
      return this.page * PER_PAGE;
    },
    filteredCurrencies() {
      return this.currencies.filter((currency) => currency.name.includes(this.filter));
    },
    paginatedCurrencies() {
      return this.filteredCurrencies.slice(this.startIndex, this.endIndex)
    },
    hasNextPage() {
      return this.filteredCurrencies.length > this.endIndex
    },
    stateOptions() {
      return {
        filter: this.filter,
        page: this.page
      }
    }
  },
  watch: {
    filter() {
      this.page = 1;
    },
    stateOptions(value) {
      window.history.pushState(
        null, 
        document.title, 
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
    paginatedCurrencies() {
      if (this.paginatedCurrencies.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    selectedCurrency() {
      this.graph = [];
    },
    currencies() {
      localStorage.setItem("cryptonomicon-list", JSON.stringify(this.currencies));
    }
  },
  methods: {
    spliceGraph(deleteCount) {
      this.graph.splice(0, deleteCount);
    },
    updateCurrency(currencyName, price) {
      this.currencies
        .filter(c => c.name === currencyName)
        .forEach(c => {
          if (c === this.selectedCurrency) {
            this.graph.push(c.price);
          }
          c.price = price;
        });
    },
    getFormatedPrice(price) {
      if (price === '-') {
        return price;
      }
      const formatedPrice = parseFloat(price);
      return formatedPrice > 1 ? formatedPrice.toFixed(EX_ROUND) : formatedPrice.toPrecision(EX_ROUND);
    },
    addNewCurrency(newCurrency) {
      if (newCurrency) {
        const currentCurrency = {
          name: newCurrency,
          price: '-'
        }
        this.filter = '';

        this.currencies = [...this.currencies, currentCurrency];
        subscribeToCurrency(currentCurrency.name, newPrice => 
          this.updateCurrency(currentCurrency.name, newPrice)
        )
      }
    },
    selectCurrency(currency) {
      this.selectedCurrency = currency;
    },
    removeCurrency(currency) {
      this.currencies = this.currencies.filter(c => c !== currency);
      if (this.selectedCurrency === currency) {
        this.selectedCurrency = null;
      }
      unsubscribeCurrency(currency.name);
    },
  }
}
</script>

<style src="./app.css">
</style>

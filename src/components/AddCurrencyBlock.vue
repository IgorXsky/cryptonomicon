<template>
        <section>
      <div class="flex">
        <div class="max-w-xs">
          <div class="mt-1 relative rounded-md shadow-md">
            <input
              v-on:keydown.enter="add"
              v-model="currency"
              type="text"
              name="wallet"
              id="wallet"
              class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
              placeholder="DOGE..."
            />
          </div>
          <!-- <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
            <span class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
              BTC
            </span>
            <span class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
              DOGE
            </span>
            <span class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
              BCH
            </span>
            <span class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer">
              CHD
            </span>
          </div> -->
          <!-- <div class="text-sm text-red-600">Такой тикер уже добавлен</div> -->
        </div>
      </div>
      <add-btn @click="add" type="button" class="my-4"/>
    </section>
</template>
<script>
    import AddBtn from './AddBtn.vue';
    export default {
      name: 'AddCurrencyBlock',
      components: {
        AddBtn
      },
      emits: {
        "add-new-currency": value => typeof value === "string" && value.length > 0
      },
      data() {
        return {
          currency: "",
        }
      },
      methods: {
        add() {
          this.$emit("add-new-currency", this.currency);
          this.currency = '';
        },
      }
    }

</script>
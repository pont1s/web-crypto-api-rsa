import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTextStore = defineStore('imageEditor', () => {
  const text = ref<string>('');

  return {
    text,
  };
});

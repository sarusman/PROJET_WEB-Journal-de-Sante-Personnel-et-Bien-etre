<template>
  <BaseButton
    :disabled="isPending"
    :color="color"
    @click="handleClick" >
    <slot />
  </BaseButton>
</template>

<script>
import BaseButton from './BaseButton.vue'; // Car c'est la meme structure

export default {
  name: 'AsyncButton',
  components: { BaseButton },
  props: {
    color: {
      type: String,
      default: 'primary'
    }
  },
  data() {
    return {
      isPending: false
    }
  },
  methods: {
    handleClick() {
      this.isPending = true;
      new Promise(resolve => setTimeout(resolve, 2000)) // on attend 2 secondes 
        .finally(() => { 
          this.isPending = false;
        });
    }
  }
}
</script>

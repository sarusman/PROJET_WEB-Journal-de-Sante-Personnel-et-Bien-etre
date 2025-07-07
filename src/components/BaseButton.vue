<template>
  <button
    class="button"
    :class="color"
    :style="styleBouton"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script>
const colorPalette = {
  primary: { bg: '#42b983', hoverBg: '#4cce93', focusBorder: '#47d696' },
  warn: { bg: '#ff5722', hoverBg: '#ff7043', focusBorder: '#ff8a65' },
  danger: { bg: '#e53935', hoverBg: '#ef5350', focusBorder: '#e57373' }
};

export default {
  name: 'BaseButton',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'primary',
      validator: (val) => ['primary', 'warn', 'danger'].includes(val)
    }
  },
  computed: {
  styleBouton() {
    const palette = colorPalette[this.color] || colorPalette['primary'];
    if (this.disabled) {
      return {
        backgroundColor: '#b2f2bb',
        cursor: 'not-allowed'
      };
    }
    return {
      '--hover-color': palette.hoverBg
    };
  }

  }
};
</script>

<style scoped>
  @import '@/assets/CSS/BaseButton.css';
</style>

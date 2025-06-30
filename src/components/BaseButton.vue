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
// Pour le HOOVER (sujet)
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
/* UTILISATION DE LA SOLUTION 1*/
.button {
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  margin: 5px;
  transition: transform 0.2s, background-color 0.2s;
  border: none;
}

.button.primary {
  background-color: #42b983;
}
.button.warn {
  background-color: #ff5722;
}
.button.danger {
  background-color: #e53935;
}

.button:hover:not(:disabled),
.button:focus:not(:disabled) {
  transform: scale(1.05);
  background-color: var(--hover-color);
}

.button:disabled {
  cursor: not-allowed;
}
</style>

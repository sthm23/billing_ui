import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';


export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e9edf3',
      100: '#c8d2e1',
      200: '#a2afc8',
      300: '#7286a5',
      400: '#455a79',
      500: '#1850a5ff',
      600: '#041634',
      700: '#03132c',
      800: '#020f25',
      900: '#020a1b',
      950: '#010510',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
        highlight: {
          background: '{primary.50}',
          focusBackground: '{primary.100}',
          color: '{primary.700}',
          focusColor: '{primary.800}',
        },
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '{surface.900}',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
        highlight: {
          background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
          focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
      },
    },

  },

})



<template>
  <v-layout
    column
    justify-center
    align-center
  >
    <v-flex xs12 sm8 md6>
      <div class="text-center">
        <logo />
        <vuetify-logo />
      </div>
      <v-card>
        <v-card-title class="headline">
          Welcome to the assorted utilities
        </v-card-title>
        <v-card-text>
          <p>This holds a few tools that I found myself searching for on Google a pretty few times.</p>
          <p>If you think that some other tools would be useful, contribute them please.</p>
          <p>This project is written in Nuxt.js, Typescript and Vuetify so that I can learn them.</p>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Logo from '~/components/Logo.vue';
import VuetifyLogo from '~/components/VuetifyLogo.vue';
import { metaStore } from '~/store';

@Component({
  components: {
    Logo,
    VuetifyLogo,
  },
})
export default class IndexPage extends Vue {
  protected created(): void {
    metaStore.changeHeader('Welcome');
  }
}
</script>

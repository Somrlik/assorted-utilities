<template>
  <v-layout>
    <canvas id="editor" class="canvas" />
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { metaStore } from '~/store';

@Component
export default class ScreenshotEditor extends Vue {
  private canvasElement!: HTMLCanvasElement;

  protected created(): void {
    metaStore.changeHeader('Screenshot editor');
  }

  protected mounted(): void {
    this.canvasElement = this.$el.querySelector('#editor') as HTMLCanvasElement;

    this.registerEventHandlers();
  }

  protected registerEventHandlers(): void {}

  protected unregisterEventHandlers(): void {}
}
</script>

<style lang="scss">
  .canvas {

  }
</style>

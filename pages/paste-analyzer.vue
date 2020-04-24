<template>
  <v-layout>
    <v-container v-if="state === 'initial'" class="text-center">
      Awaiting input - press Ctrl+V to paste the contents of your clipboard,<br>
      or you can drag and drop anything, the DataTransfer API is the same.
    </v-container>
    <v-container v-else-if="state === 'dragging'" class="text-center">
      Awaiting the drop...
    </v-container>
    <v-container v-else-if="state === 'processing'" class="text-center">
      Processing clipboard data...
    </v-container>
    <v-container v-else-if="state === 'not_supported'" class="text-center">
      The clipboard was empty or the clipboard API is not supported in your browser.
    </v-container>
    <v-container v-else>
      <v-row>
        <v-col cols="12">
          <v-btn v-for="(dti, idx) in clipboardDetails.DTIs" :key="idx" @click="scrollToId(`dti-${idx}`)">
            {{ dti.type }}
          </v-btn>
          <v-btn v-for="(file, idx) in clipboardDetails.files" :key="idx" @click="scrollToId(`file-${idx}`)">
            {{ file.raw.name }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row v-if="clipboardDetails.DTIs.length > 0">
        <v-col cols="12">
          <v-card v-for="(dti, idx) in clipboardDetails.DTIs" :key="idx">
            <v-card-title :id="`dti-${idx}`">
              {{ dti.type }}
            </v-card-title>
            <v-card-text>
              <pre class="pre">{{ dti.data }}</pre>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12">
          No plain data was present in the DataTransfer.
        </v-col>
      </v-row>
      <v-row v-if="clipboardDetails.files.length > 0">
        <v-col cols="12">
          <v-card v-for="(file, idx) in clipboardDetails.files" :key="idx">
            <v-card-title :id="`file-${idx}`">
              {{ file.raw.name }}
            </v-card-title>
            <v-card-text>
              <span>Size: {{ file.raw.size }} bytes</span>
              <br>
              <span>Last modified: {{ new Date(file.raw.lastModified) }}</span>
              <br>
              <FileDisplay :file="file.raw" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col cols="12">
          No files were present in the DataTransfer.
        </v-col>
      </v-row>
    </v-container>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { metaStore } from '~/store';
import FileDisplay from '~/components/FileDisplay.vue';

const DRAG_EVENTS_TO_PREVENT = ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'];
const DRAG_EVENTS_START = ['dragover', 'dragenter'];
const DRAG_EVENTS_STOP = ['dragleave', 'dragend'/*, 'drop' */];

interface ClipboardDetails {
  DTIs: ClipboardDTI[];
  files: ClipboardFile[];
}

interface ClipboardDTI {
  type: string;
  data: any;
}

interface ClipboardFile {
  raw: File;
}

enum State {
  INITIAL = 'initial',
  PROCESSING = 'processing',
  DRAGGING = 'dragging',
  NOT_SUPPORTED = 'not_supported',
  DONE = 'done',
}

@Component({
  components: { FileDisplay },
})
export default class PasteAnalyzer extends Vue {
  private state: State = State.INITIAL;
  private clipboardDetails: ClipboardDetails = {
    DTIs: [],
    files: [],
  };

  protected created(): void {
    metaStore.changeHeader('Paste/drag analyzer');
  }

  protected mounted(): void {
    this.registerEventHandlers();
  }

  protected destroyed(): void {
    this.unregisterEventHandlers();
  }

  protected scrollToId(id: string): void {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  protected handleDataTransfer(dt: DataTransfer): void {
    const DTIs: ClipboardDTI[] = [];
    dt.types.forEach((dataType) => {
      // Ignore the Files type, because we are processing them another way
      if (dataType === 'Files') {
        return;
      }

      DTIs.push({
        type: dataType,
        data: dt.getData(dataType),
      });
    });

    const files: ClipboardFile[] = [];
    for (let i = 0; i < dt.files.length; i++) {
      const file = dt.files.item(i);

      if (file === null) {
        continue;
      }

      files.push({
        raw: file,
      });
    }

    Vue.set(this.clipboardDetails, 'DTIs', DTIs);
    Vue.set(this.clipboardDetails, 'files', files);
    this.state = State.DONE;
  }

  protected handlePaste(e: ClipboardEvent): void {
    this.state = State.PROCESSING;
    if (!e.clipboardData) {
      this.state = State.NOT_SUPPORTED;
      return;
    }

    this.handleDataTransfer(e.clipboardData);
  }

  protected handleDrop(e: DragEvent): void {
    this.state = State.PROCESSING;
    if (!e.dataTransfer) {
      this.state = State.NOT_SUPPORTED;
      return;
    }

    this.handleDataTransfer(e.dataTransfer);
  }

  protected startDrag(): void {
    this.state = State.DRAGGING;
  }

  protected stopDrag(): void {
    if (this.clipboardDetails.DTIs.length > 0 || this.clipboardDetails.files.length > 0) {
      this.state = State.DONE;
    } else {
      this.state = State.INITIAL;
    }
  }

  protected registerEventHandlers(): void {
    document.body.addEventListener('paste', this.handlePaste);
    DRAG_EVENTS_TO_PREVENT.forEach((eventName) => {
      document.body.addEventListener(eventName, preventDefaultAndStopPropagation);
    });
    DRAG_EVENTS_START.forEach((eventName) => {
      document.body.addEventListener(eventName, this.startDrag);
    });
    DRAG_EVENTS_STOP.forEach((eventName) => {
      document.body.addEventListener(eventName, this.stopDrag);
    });
    document.body.addEventListener('drop', this.handleDrop);
  }

  protected unregisterEventHandlers(): void {
    document.body.removeEventListener('paste', this.handlePaste);
    DRAG_EVENTS_TO_PREVENT.forEach((eventName) => {
      document.body.removeEventListener(eventName, preventDefaultAndStopPropagation);
    });
    DRAG_EVENTS_START.forEach((eventName) => {
      document.body.removeEventListener(eventName, this.startDrag);
    });
    DRAG_EVENTS_STOP.forEach((eventName) => {
      document.body.removeEventListener(eventName, this.stopDrag);
    });
    document.body.removeEventListener('drop', this.handleDrop);
  }
}

function preventDefaultAndStopPropagation(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
}
</script>

<style lang="scss">
  .pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: auto;
  }
</style>

<template>
  <v-layout>
    <v-flex class="text-center">
      <v-form>
        <v-text-field :value="formattedUUID" label="Generated UUID" class="font-monospace" />
        <v-btn-toggle v-model="asciiOrBinary">
          <v-btn value="ascii">
            ASCII
          </v-btn>
          <v-btn value="binary">
            Binary
          </v-btn>
        </v-btn-toggle>
        <v-flex v-if="! binary">
          <v-checkbox v-model="caps" :disabled="binary" label="Capitalize letters" />
          <v-checkbox v-model="dashes" :disabled="binary" label="Use dashes" />
        </v-flex>
        <v-flex v-else>
          <v-radio-group v-model="base64OrBytes">
            <v-radio label="Raw binary (might not be copyable)" value="raw" />
            <v-radio label="As base64" value="base64" />
            <v-radio label="As bytes" value="bytes" />
          </v-radio-group>
          <v-checkbox v-model="decimalDigest" :disabled="base64OrBytes !== 'bytes'" label="As bytes in base 10" />
        </v-flex>
        <v-btn color="primary" @click="generateNew()">
          Generate new
        </v-btn>
        <v-btn color="secondary" @click="generateNewAndCopy()">
          <v-icon>mdi-content-copy</v-icon>
          Generate and copy to clipboard
        </v-btn>
        <v-btn color="secondary" @click="copyToClipboard()">
          Copy to clipboard
        </v-btn>
        <v-alert :value="showCopyingState" :type="copyingState === 'success' ? 'success' : 'error'" transition="slide-y-reverse-transition" dense>
          <template v-if="copyingState !== 'success'">
            Failed to copy.
          </template>
          <template v-else>
            Copied!
          </template>
        </v-alert>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { generateUUID } from '~/utils/generate-uuid';
import { writeToClipboard } from '~/utils/clipboard';
import { metaStore } from '~/store';

enum AsciiOrBinary {
  ASCII = 'ascii',
  BINARY = 'binary',
}

enum Base64OrBytes {
  RAW = 'raw',
  BASE64 = 'base64',
  BYTES = 'bytes',
}

enum CopyingState {
  NONE = 'none',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

@Component
export default class UUIDGeneratorPage extends Vue {
  uuid: string = '';
  caps: boolean = false;
  dashes: boolean = true;
  decimalDigest: boolean = false;
  asciiOrBinary: AsciiOrBinary = AsciiOrBinary.ASCII;
  base64OrBytes: Base64OrBytes = Base64OrBytes.BASE64;
  copyingState: CopyingState = CopyingState.NONE;

  protected created(): void {
    metaStore.changeHeader('UUID Generator');
    this.uuid = generateUUID();
  }

  private generateNew(): void {
    this.uuid = generateUUID();
  }

  private generateNewAndCopy(): void {
    this.generateNew();
    this.copyToClipboard();
  }

  private copyToClipboard(): void {
    this.copyingState = CopyingState.NONE;
    writeToClipboard(this.formattedUUID).then((wasSuccessful) => {
      if (wasSuccessful) {
        this.copyingState = CopyingState.SUCCESS;
      } else {
        this.copyingState = CopyingState.FAILURE;
      }
    }).finally(() => {
      setTimeout(() => {
        this.copyingState = CopyingState.NONE;
      }, 2500);
    });
  }

  get showCopyingState(): boolean {
    return this.copyingState !== CopyingState.NONE;
  }

  get binary(): boolean {
    return this.asciiOrBinary === AsciiOrBinary.BINARY;
  }

  get base64(): boolean {
    return this.base64OrBytes === Base64OrBytes.BASE64;
  }

  get formattedUUID(): string {
    let final = this.uuid;

    if (this.binary) {
      const hexDigest = final.replace(/-/g, '');
      const digestBytes = hexDigest.match(/.{1,2}/g)?.map((byteDigest: string) => {
        return parseInt(byteDigest, 16);
      });

      if (digestBytes === undefined) {
        return 'NaN';
      }

      final = String.fromCharCode(...digestBytes);

      if (this.base64OrBytes !== Base64OrBytes.RAW) {
        if (this.base64) {
          final = btoa(final);
        } else if (this.decimalDigest) {
          final = digestBytes.join(' ');
        } else {
          final = digestBytes.map(n => n.toString(16).padStart(2, '0')).join(' ');
        }
      }
    } else {
      if (this.caps) {
        final = final.toUpperCase();
      }

      if (!this.dashes) {
        final = final.replace(/-/g, '');
      }
    }

    return final;
  }
}
</script>

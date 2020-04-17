<template>
  <v-layout justify-center align-center>
    <v-flex>
      <v-textarea v-model="input" label="Input" @select.native="inputEvent($event)" />
      <v-list disabled>
        <v-list-item>
          <v-list-item-content>
            Characters: {{ charactersCount }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            Bytes: {{ bytesCount }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-container>
        <v-row class="mb-6">
          <v-col v-for="(detail, idx) in selectedDetails" :key="idx">
            <v-card class="text-center flex-column">
              <p class="display-4">
                {{ detail.character }}
              </p>
              <p>{{ detail.urlencode }}</p>
              <p>{{ detail.utf16 }}</p>
              <a :href="detail.link" title="Detail @charbase.com">charbase.com</a>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { metaStore } from '~/store';

interface CharDetails {
  character: string;
  bytesWidth: number;
  urlencode: string;
  utf16: string;
  link: string;
}

const CHARBASE_LINK = 'https://charbase.com';

@Component
export default class StringUtilsPage extends Vue {
  private input: string = '';
  private selectedChars: string = '';

  protected created(): void {
    metaStore.changeHeader('String utilities');
  }

  private inputEvent(event: InputEvent): void {
    const target = event.target as HTMLTextAreaElement;
    this.selectedChars = target.value.substring(target.selectionStart, target.selectionEnd);
  }

  private get selectedDetails(): CharDetails[] {
    const characterCount = [...this.selectedChars].length;
    if (characterCount > 10) {
      return [];
    }

    return [...this.selectedChars].map((char) => {
      const utf16Escape = [0, 1].map(pos => char.charCodeAt(pos)).filter(n => !isNaN(n)).map(n => `\\u${n.toString(16).padStart(4, '0')}`).join('');

      return {
        character: char,
        bytesWidth: StringUtilsPage.getBytesCount(char),
        urlencode: encodeURIComponent(char),
        utf16: utf16Escape,
        link: `${CHARBASE_LINK}/${char.codePointAt(0)?.toString(16)}`,
      };
    });
  }

  private static getBytesCount(input: string): number {
    return encodeURIComponent(input).split(/%(?:u[0-9A-F]{2})?[0-9A-F]{2}|./).length - 1;
  }

  private get charactersCount(): number {
    return [...this.input].length;
  }

  private get bytesCount(): number {
    return StringUtilsPage.getBytesCount(this.input);
  }

  private get urlencode(): string {
    return encodeURIComponent(this.input);
  }
}
</script>

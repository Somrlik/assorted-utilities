<template>
  <v-img contain alt="" :src="src" />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

const MAX_PREVIEW_FILE_SIZE = 10 * 1024 * 1024;
const PNG_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
const PNG_NO_PREVIEW_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADqElEQVR4Xu2aW8hNQRTHf5/7tSjxgqJEiBIPcovI7UkSJcmDRBIiKdcoUkRJkgeKEB5IeaAoyT0PyOVRvAgl97v+Nbv2N+19zmxn73P27LPn7fvOmtlr/ee/1qy1Zlpo8tHS5PZTAlAyoMkRKF2gyQlQBsE4F1gAbAaGAG08Z8lf4DmwHTht2xIFwPwoQc9BCNTXxp4J2xIFwGNgWEEMts14AgyvBsAvoG1BAfhj2xbFAPlMeOwEdgA/PAOlo/H7DZberWx2AUAL+WZ8YHNP4H2tAPicLHUDPpYAtEYgsQvkhQGdgBXAwtAppah+AjgEfI+IUV2BT0VgQD/gcoXjWUf3TOCVZWwhANDO33fITQTCaIsJXYDPvjNgLbDX8QheA+wPyRYCgAfAKEcAxJQxRQPgG6BcxGV8BbTrwegMfPHdBZoegFpcoBAMUGDb58J/YDVwICSrE0RuER4NSYRUXaoSswstF7vk/wpurcrYiImPTAAMJ0QNB0AKKEtT9qaCSrujTlNSIPqaRCgOBBk/KyIRajgApwB1YcJDZ/o6l623ZMSE5TGp8OGYVFhzFEQb4gKbTB8hytaNwO7/ACHplIYBMAc4DxW7zkuBo0ktSijfIYIZmQfBkcBNQIVIpfEbUANWQGU16g5AH+Au0N/RIgXG2cDVKvLtze8/HdcNxOoKgPztGjA2oZKq16cA92LmrQR2GXfSOZ/EbQSc3c7LzAWOAYsTGh+IvwPGA89C89sBB4Flof/p+FwEnHT8Tt0AWA/scVQqTuw1MANQXd/bdHqmRQirba8ge8nhe3UBQD58MaUrNAXGp8BAq6qzbVV6Ox24UQUEsciOG6m6gG6QbgHdHXYjbZEPwGTgYYWFMwWgl4n4A9K2LMF6b4AJwIuYOapB5DLhkQoD5FtXgEkJlM1K9CUwLqIO0PcyA+AIoEwuL0NxYyLw1lIoEwBWWTV3XkBQyax8InwTpLcNCqypuYCOJfXn83p7fN3cDwQVYKoADAZuAz3ysuUxelwA5pqdTw0A3bLeAQbl3PhAvePAEvOHOlE1uYAivmg/1RPjAzXVfVI/sWYAlI+rIPFxbDWPJGpigI+GV9I5cSJUAlAwBEoGxAYE80PSnr1vBCkZUI0Byp19fx8cx0qnh5J6eDTUN1476qsrtBHVGFDkx9LzgHPVANDvus/bAqgA8t0dRHt1m7cBZ22m5OUNoCOD0xcrAUgfU79WLBng136lr23JgPQx9WvFpmfAPz+5xEGs8PNSAAAAAElFTkSuQmCC';

type DataURLBuffer = string | ArrayBuffer | null;

@Component
export default class FileDisplay extends Vue {
  @Prop(File) readonly file!: File;
  private src: string = PNG_PIXEL;

  public mounted(): void {
    this.readFileAsDataURL(this.file).then((dataURL) => {
      this.src = dataURL as string;
    }).catch(() => {
      this.src = PNG_PIXEL;
    });
  }

  private async processDataUrl(dataUrl: DataURLBuffer): Promise<void> {
    if (dataUrl === null) {
      // This can rarely happen, for example when the file is deleted from users filesystem when read.
      return;
    }

    this.src = dataUrl as string;
    const imgElement = this.$el.querySelector('img') as HTMLImageElement;

    if (imgElement.src === window.location.href) {
      // This is even rarer and it means the same thing as above, only this works in IE.
      return;
    }

    await new Promise((resolve) => {
      // If the loading of image fails in 1.5 seconds, just display a placeholder image.
      const loadingTimeoutHandle = setTimeout(() => {
        imgElement.src = PNG_NO_PREVIEW_IMAGE;
        resolve();
      }, 1500);

      if (imgElement.complete) {
        resolve();
      } else {
        // If the image is NOT loaded when executing this function, we just execute it after the image was loaded
        // using vanilla event listener. Since we are registering it here, each subsequent call to this function
        // when the image is not loaded would result in adding another event listener - that is why this listener
        // is registered only once. There could be a problem if the user is fast enough to change the value and
        // invoke this function when the image is still loading - this is however unlikely and thus not handled.
        imgElement.addEventListener('load', () => {
          clearTimeout(loadingTimeoutHandle);
          resolve();
        }, {
          once: true,
        });
      }
    });
  }

  private readFileAsDataURL(file: File): Promise<DataURLBuffer> {
    // The FileReader API is somewhat new, so it doesn't work for IE < 10.
    const reader = new FileReader();

    return new Promise<DataURLBuffer>((resolve, reject) => {
      try {
        if (file.size > MAX_PREVIEW_FILE_SIZE) {
          reject(new Error('File too large'));
        }

        // Registering the event listener before calling the reading function is safer, since
        // some implementation use synchronous buffer reading for these resources. This is in accordance
        // with HTML5 spec but makes our life harder.
        reader.addEventListener('load', () => {
          resolve(reader.result);
        }, false);

        if (file) {
          reader.readAsDataURL(file);
        }
      } catch (e) {
        reject(e);
      }
    });
  }
}
</script>

<style>

</style>

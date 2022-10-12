<script lang="ts" setup>
import { reactive } from 'vue';
import { NInput, NScrollbar, useMessage } from 'naive-ui';

import {
  arrBufToBase64,
  arrBufToStr,
  CharSize,
  decrypt,
  encrypt,
  exportPrivateKey,
  exportPublicKey,
  HashAlg,
  KeyUse,
  makeKeypair,
} from '@/utils/rsa';

import VButton from '@/components/kit/VButton.vue';

const message = useMessage();

const keyPair = reactive({
  publicKey: '',
  privateKey: '',
});

const onGenerateKeysClickHandler = async () => {
  const { publicKey, privateKey } = await makeKeypair(2048, HashAlg.SHA_256, KeyUse.Exchange);
  keyPair.publicKey = await exportPublicKey(publicKey);
  keyPair.privateKey = await exportPrivateKey(privateKey);
};

const onPublicKeyCopyButtonClickHandler = async () => {
  await navigator.clipboard.writeText(keyPair.publicKey);
};

const onPrivateKeyCopyButtonClickHandler = async () => {
  await navigator.clipboard.writeText(keyPair.privateKey);
};

const encrypted = reactive({
  message: '',
  publicKey: '',
  cipherMessage: '',
});

const onEncryptionButtonClickHandler = async () => {
  try {
    encrypted.cipherMessage = arrBufToBase64(await encrypt(encrypted.message, encrypted.publicKey));
  } catch (e) {
    message.error('Invalid public key');
    console.error(e);
  }
};

const onEncryptionCopyButtonClickHandler = async () => {
  await navigator.clipboard.writeText(encrypted.cipherMessage);
};

const decrypted = reactive({
  cipherMessage: '',
  privateKey: '',
  message: '',
});

const onDecryptionButtonClickHandler = async () => {
  try {
    decrypted.message = arrBufToStr(await decrypt(decrypted.cipherMessage, decrypted.privateKey), CharSize.B16);
  } catch (e) {
    decrypted.message = '';
    message.error('Invalid private key');
    console.error(e);
  }
};

const onDecryptionCopyButtonClickHandler = async () => {
  await navigator.clipboard.writeText(decrypted.message);
};
</script>

<template>
  <div class="main-container">
    <div class="content-panel generate-keys">
      <v-button type="primary" @click="onGenerateKeysClickHandler">
        Сгенерировать ключи
      </v-button>
      <div class="keys-container">
        <div class="key-content">
          <div class="key">
            <n-scrollbar>
              {{ keyPair.publicKey }}
            </n-scrollbar>
          </div>
          <v-button type="primary" @click="onPublicKeyCopyButtonClickHandler">
            Скопировать
          </v-button>
        </div>
        <div class="key-content">
          <div class="key">
            <n-scrollbar>
              {{ keyPair.privateKey }}
            </n-scrollbar>
          </div>
          <v-button type="primary" @click="onPrivateKeyCopyButtonClickHandler">
            Скопировать
          </v-button>
        </div>
      </div>
    </div>
    <div class="operations-container">
      <div class="content-panel">
        <h2>RSA шифрование</h2>
        <div class="column-content">
          <div class="input">
            <span>Введите сообщение для шифрования</span>
            <n-input
              v-model:value="encrypted.message"
              type="textarea"
              rows="6"
              placeholder="Введите текст для шифрования"
            />
          </div>
          <div class="input">
            <span>Введите открытый ключ</span>
            <n-input
              v-model:value="encrypted.publicKey"
              type="textarea"
              rows="6"
              show-password-on="click"
              placeholder="Введите открытый ключ"
            />
          </div>
          <v-button type="primary" @click="onEncryptionButtonClickHandler">
            Зашифровать
          </v-button>
        </div>
        <div v-if="encrypted.cipherMessage" class="result-container">
          <span>Зашифрованное сообщение:</span>
          <div class="result">
            <n-scrollbar>
              {{ encrypted.cipherMessage }}
            </n-scrollbar>
          </div>
          <v-button type="primary" @click="onEncryptionCopyButtonClickHandler">
            Скопировать
          </v-button>
        </div>
      </div>

      <div class="content-panel">
        <h2>RSA дешифрование</h2>
        <div class="column-content">
          <div class="input">
            <span>Введите текст для расшифровки</span>
            <n-input
              v-model:value="decrypted.cipherMessage"
              type="textarea"
              rows="6"
              placeholder="Введите текст для расшифровки"
            />
          </div>
          <div class="input">
            <span>Введите закрытый ключ</span>
            <n-input
              v-model:value="decrypted.privateKey"
              type="textarea"
              rows="6"
              show-password-on="click"
              placeholder="Введите закрытый ключ"
            />
          </div>
          <v-button type="primary" @click="onDecryptionButtonClickHandler">
            Расшифровать
          </v-button>
        </div>
        <div v-if="decrypted.message" class="result-container">
          <span>Расширофванное сообщение:</span>
          <div class="result">
            <n-scrollbar>
              {{ decrypted.message }}
            </n-scrollbar>
          </div>
          <v-button type="primary" @click="onDecryptionCopyButtonClickHandler">
            Скопировать
          </v-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: calc(var(--vh, 1vh) * 100);
  width: 100%;
  overflow: auto;

  .content-panel {
    background-color: #fafafa;
    border-radius: 1rem;
    padding: 1rem;
  }

  .generate-keys {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .keys-container {
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 1rem;
      width: 100%;
      height: 100%;

      @media (min-width: 927px) {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
      }

      .key {
        background-color: #ffffff;
        border-radius: 1rem;
        padding: 1rem;
        word-wrap: anywhere;
        height: 280px;
        margin-bottom: 0.5rem;
      }
    }
  }

  .operations-container {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    width: 100%;
    height: 100%;

    @media (min-width: 927px) {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
    }

    .column-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .input {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
    }

    .result-container {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .result {
        background-color: #ffffff;
        border-radius: 1rem;
        padding: 1rem;
        word-wrap: anywhere;
        overflow-wrap: anywhere;
        height: 280px;
      }
    }
  }
}
</style>

<script lang="ts" setup>
import { reactive } from 'vue';
import { NInput, NScrollbar, useMessage } from 'naive-ui';

import {
  arrBufToBase64,
  arrBufToStr,
  CharSize,
  decrypt,
  encrypt,
  sign,
  verify,
  exportPrivateKey,
  exportPublicKey,
  HashAlg,
  KeyUse,
  makeKeypair,
} from '@/utils/rsa';

import VButton from '@/components/kit/VButton.vue';

const message = useMessage();

const keyPairExchange = reactive({
  publicKey: '',
  privateKey: '',
});

const keyPairWrite = reactive({
  publicKey: '',
  privateKey: '',
});

const onGenerateKeysClickHandler = async () => {
  const {
    publicKey: publicKeyExchange,
    privateKey: privateKeyExchange,
  } = await makeKeypair(4096, HashAlg.SHA_256, KeyUse.Exchange);
  keyPairExchange.publicKey = await exportPublicKey(publicKeyExchange);
  keyPairExchange.privateKey = await exportPrivateKey(privateKeyExchange);

  const {
    publicKey: publicKeyWrite,
    privateKey: privateKeyWrite,
  } = await makeKeypair(4096, HashAlg.SHA_256, KeyUse.Write);

  keyPairWrite.publicKey = await exportPublicKey(publicKeyWrite);
  keyPairWrite.privateKey = await exportPrivateKey(privateKeyWrite);
};

const encrypted = reactive({
  message: '',
  publicKeyExchange: '',
  privateKeyWrite: '',
  cipherMessage: '',
  signatureMessage: '',
});

const onEncryptionButtonClickHandler = async () => {
  try {
    encrypted.cipherMessage = arrBufToBase64(await encrypt(encrypted.message, encrypted.publicKeyExchange));
  } catch (e) {
    message.error('Encrypted failed. Invalid key');
    console.error(e);
  }

  try {
    encrypted.signatureMessage = arrBufToBase64(await sign(encrypted.cipherMessage, encrypted.privateKeyWrite));
  } catch (e) {
    message.error('Sign failed. Invalid key');
    console.error(e);
  }
};

const decrypted = reactive({
  cipherMessage: '',
  signatureMessage: '',
  privateKeyExchange: '',
  publicKeyWrite: '',
  message: '',
});

const onDecryptionButtonClickHandler = async () => {
  try {
    decrypted.message = arrBufToStr(await decrypt(decrypted.cipherMessage, decrypted.privateKeyExchange), CharSize.B16);
  } catch (e) {
    decrypted.message = '';
    message.error('Decrypted failed. Invalid private key');
    console.error(e);
  }

  try {
    const signResult = await verify(decrypted.cipherMessage, decrypted.signatureMessage, decrypted.publicKeyWrite);
    if (signResult) {
      message.success('Подпись прошла проверку');
    } else {
      message.error('Подпись не прошла провверку');
    }
  } catch (e) {
    decrypted.message = '';
    message.error('Verify message failed');
    console.error(e);
  }
};

const onTextCopyClickHandler = async (text: string) => {
  await navigator.clipboard.writeText(text);
};
</script>

<template>
  <div class="main-container">
    <div class="content-panel generate-keys">
      <v-button type="primary" @click="onGenerateKeysClickHandler">
        Сгенерировать ключи
      </v-button>
      <div v-if="keyPairExchange.publicKey && keyPairExchange.privateKey">
        <h2>Ключи шифрования RSA-OAEP</h2>
        <div class="keys-container">
          <div class="key-content">
            <div class="key">
              <n-scrollbar>
                {{ keyPairExchange.publicKey }}
              </n-scrollbar>
            </div>
            <v-button type="primary" @click="onTextCopyClickHandler(keyPairExchange.publicKey)">
              Скопировать
            </v-button>
          </div>
          <div class="key-content">
            <div class="key">
              <n-scrollbar>
                {{ keyPairExchange.privateKey }}
              </n-scrollbar>
            </div>
            <v-button type="primary" @click="onTextCopyClickHandler(keyPairExchange.privateKey)">
              Скопировать
            </v-button>
          </div>
        </div>
      </div>

      <div v-if="keyPairWrite.publicKey && keyPairWrite.privateKey">
        <h2>Ключи цифровой подписи RSASSA-PKCS1-v1_5</h2>
        <div class="keys-container">
          <div class="key-content">
            <div class="key">
              <n-scrollbar>
                {{ keyPairWrite.privateKey }}
              </n-scrollbar>
            </div>
            <v-button type="primary" @click="onTextCopyClickHandler(keyPairWrite.privateKey)">
              Скопировать
            </v-button>
          </div>
          <div class="key-content">
            <div class="key">
              <n-scrollbar>
                {{ keyPairWrite.publicKey }}
              </n-scrollbar>
            </div>
            <v-button type="primary" @click="onTextCopyClickHandler(keyPairWrite.publicKey)">
              Скопировать
            </v-button>
          </div>
        </div>
      </div>
    </div>
    <div class="operations-container">
      <div class="content-panel">
        <h2>RSA шифрование и подпись</h2>
        <div class="column-content">
          <div class="input">
            <span>Введите сообщение для шифрования и подписи</span>
            <n-input
              v-model:value="encrypted.message"
              type="textarea"
              rows="6"
              placeholder="Введите текст для шифрования и подпись"
            />
          </div>
          <div class="input">
            <span>Введите открытый ключ RSA-OAEP</span>
            <n-input
              v-model:value="encrypted.publicKeyExchange"
              type="textarea"
              rows="6"
              show-password-on="click"
              placeholder="Введите открытый ключ RSA-OAEP"
            />
          </div>
          <div class="input">
            <span>Введите закрытый ключ RSASSA-PKCS1-v1_5</span>
            <n-input
              v-model:value="encrypted.privateKeyWrite"
              type="textarea"
              rows="6"
              show-password-on="click"
              placeholder="Введите закрытый ключ RSASSA-PKCS1-v1_5"
            />
          </div>
          <v-button type="primary" @click="onEncryptionButtonClickHandler">
            Зашифровать и подписать
          </v-button>
        </div>
        <div v-if="encrypted.cipherMessage" class="result-container">
          <span>Зашифрованное сообщение:</span>
          <div class="result">
            <n-scrollbar>
              {{ encrypted.cipherMessage }}
            </n-scrollbar>
          </div>
          <div>
            <v-button type="primary" @click="onTextCopyClickHandler(encrypted.cipherMessage)">
              Скопировать
            </v-button>
          </div>
        </div>
        <div v-if="encrypted.signatureMessage" class="result-container">
          <span>Цифровая подпись на зишфрованное сообщение:</span>
          <div class="result">
            <n-scrollbar>
              {{ encrypted.signatureMessage }}
            </n-scrollbar>
          </div>
          <div>
            <v-button type="primary" @click="onTextCopyClickHandler(encrypted.signatureMessage)">
              Скопировать
            </v-button>
          </div>
        </div>
      </div>

      <div class="content-panel">
        <h2>RSA дешифрование и проверка подписи</h2>
        <div class="column-content">
          <div class="input">
            <span>Введите текст для расшифровки и проверки подписи</span>
            <n-input
              v-model:value="decrypted.cipherMessage"
              type="textarea"
              rows="6"
              placeholder="Введите текст для расшифровки и проверки подписи"
            />
          </div>
          <div class="input">
            <span>Введите цифровую подпись RSASSA-PKCS1-v1_5</span>
            <n-input
              v-model:value="decrypted.signatureMessage"
              type="textarea"
              rows="6"
              placeholder="Введите цифровую подпись RSASSA-PKCS1-v1_5"
            />
          </div>
          <div class="input">
            <span>Введите закрытый ключ RSA-OAEP</span>
            <n-input
              v-model:value="decrypted.privateKeyExchange"
              type="textarea"
              rows="6"
              show-password-on="click"
              placeholder="Введите закрытый ключ RSA-OAEP"
            />
          </div>
          <div class="input">
            <span>Введите открытый ключ RSASSA-PKCS1-v1_5</span>
            <n-input
              v-model:value="decrypted.publicKeyWrite"
              type="textarea"
              rows="6"
              show-password-on="click"
              placeholder="Введите открытый ключ RSASSA-PKCS1-v1_5"
            />
          </div>
          <v-button type="primary" @click="onDecryptionButtonClickHandler">
            Расшифровать и проверить подпись
          </v-button>
        </div>
        <div v-if="decrypted.message" class="result-container">
          <span>Расширофванное сообщение:</span>
          <div class="result">
            <n-scrollbar>
              {{ decrypted.message }}
            </n-scrollbar>
          </div>
          <div>
            <v-button type="primary" @click="onTextCopyClickHandler(decrypted.message)">
              Скопировать
            </v-button>
          </div>
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

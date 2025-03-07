<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../preload/src/configuration-registry';

import { providerInfos } from '../../stores/providers';
import { onMount } from 'svelte';
import type { ProviderInfo } from '../../../../preload/src/api/provider-info';
import PreferencesContainerConnectionCreationRendering from './PreferencesContainerConnectionCreationRendering.svelte';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
import Logger from './Logger.svelte';
import { writeToTerminal } from './Util';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;

let showModal: ProviderInfo = undefined;

let providerLifecycleError = '';
router.subscribe(async route => {
  providerLifecycleError = '';
});

let providers: ProviderInfo[] = [];
onMount(() => {
  providerLifecycleError = '';
  providerInfos.subscribe(value => {
    providers = value;
  });
});

let providerInfo: ProviderInfo;
$: providerInfo = providers.filter(provider => provider.internalId === providerInternalId)[0];
let waiting = false;

let logsTerminal;

async function startProvider(): Promise<void> {
  waiting = true;
  await window.startProviderLifecycle(providerInfo.internalId);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  console.log('receive response from the server side: started');
  waiting = false;
}

async function stopProvider(): Promise<void> {
  waiting = true;
  await window.stopProviderLifecycle(providerInfo.internalId);
  console.log('receive response from the server side: stopped');
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  waiting = false;
}

async function startReceivinLogs(provider: ProviderInfo): Promise<void> {
  const logHandler = (newContent: any[]) => {
    writeToTerminal(logsTerminal, newContent);
  };
  window.providerLogs.startReceiveLogs(provider.internalId, logHandler, logHandler, logHandler);
}

async function stopReceivingLogs(provider: ProviderInfo): Promise<void> {
  await window.providerLogs.stopReceiveLogs(provider.internalId);
}
</script>

<div class="flex flex-1 flex-col">
  <h1 class="capitalize text-xl">{providerInfo?.name} Provider</h1>

  <!-- Manage lifecycle-->
  {#if providerInfo?.lifecycleMethods}
    <div class="pl-1 py-2">
      <div class="text-sm italic  text-gray-400">Status</div>
      <div class="pl-3">{providerInfo.status}</div>
    </div>

    <div class="py-2 flex flex:row ">
      <!-- start is enabled only in stopped mode-->
      {#if providerInfo?.lifecycleMethods.includes('start')}
        <div class="px-2 text-sm italic  text-gray-400">
          <button
            disabled="{providerInfo.status !== 'stopped'}"
            on:click="{() => startProvider()}"
            class="pf-c-button pf-m-primary"
            type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-play" aria-hidden="true"></i>
            </span>
            Start
          </button>
        </div>
      {/if}

      <!-- stop is enabled only in started mode-->
      {#if providerInfo.lifecycleMethods.includes('stop')}
        <div class="px-2 text-sm italic  text-gray-400">
          <button
            disabled="{providerInfo.status !== 'started'}"
            on:click="{() => stopProvider()}"
            class="pf-c-button pf-m-primary"
            type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-stop" aria-hidden="true"></i>
            </span>
            Stop
          </button>
        </div>
      {/if}
      <div class="px-2 text-sm italic  text-gray-400">
        <button
          type="button"
          on:click="{() => {
            showModal = providerInfo;
            // startReceivinLogs(providerInfo);
          }}"
          class="pf-c-button pf-m-secondary">
          <span class="pf-c-button__icon pf-m-start">
            <i class="fas fa-history" aria-hidden="true"></i>
          </span>
          Show Logs
        </button>
      </div>
    </div>

    {#if providerLifecycleError}
      <div class="text-red-600">
        {providerLifecycleError}
      </div>
    {/if}
  {/if}

  <!-- Create connection panel-->
  {#if providerInfo?.containerProviderConnectionCreation === true}
    <PreferencesContainerConnectionCreationRendering providerInfo="{providerInfo}" properties="{properties}" />
  {/if}
</div>
{#if showModal}
  <Modal
    on:close="{() => {
      stopReceivingLogs(showModal);
      showModal = undefined;
    }}">
    <h2 slot="header">Logs</h2>
    <div id="log" style="height: 400px; width: 647px;">
      <div style="width:100%; height:100%; flexDirection: column;">
        <Logger bind:logsTerminal onInit="{() => startReceivinLogs(showModal)}" />
      </div>
    </div>
  </Modal>
{/if}

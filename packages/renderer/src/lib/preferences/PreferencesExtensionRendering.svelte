<script lang="ts">
import { onMount } from 'svelte';
import { extensionInfos } from '../../stores/extensions';
import type { ExtensionInfo } from '../../../../preload/src/api/extension-info';
export let extensionId: string = undefined;

let extensions: ExtensionInfo[] = [];
onMount(() => {
  extensionInfos.subscribe(value => {
    extensions = value;
  });
});

let extensionInfo: ExtensionInfo;
$: extensionInfo = extensions.find(extension => extension.id === extensionId);

async function stopExtension() {
  await window.stopExtension(extensionInfo.id);
  window.dispatchEvent(new CustomEvent('extension-stopped', { detail: extensionInfo }));
}
async function startExtension() {
  await window.startExtension(extensionInfo.id);
  window.dispatchEvent(new CustomEvent('extension-started', { detail: extensionInfo }));
}
</script>

<div class="flex flex-1 flex-col">
  {#if extensionInfo}
    <div class="pl-1 py-2">
      <h1 class="capitalize text-xl">{extensionInfo.name} Extension</h1>
      <div class="text-sm italic  text-gray-400">{extensionInfo.displayName}</div>
    </div>

    <!-- Manage lifecycle-->
    <div class="pl-1 py-2">
      <div class="text-sm italic  text-gray-400">Status</div>
      <div class="pl-3">{extensionInfo.state}</div>
    </div>

    <div class="py-2 flex flex:row ">
      <!-- start is enabled only in stopped mode-->
      <div class="px-2 text-sm italic  text-gray-400">
        <button
          disabled="{extensionInfo.state !== 'inactive'}"
          on:click="{() => startExtension()}"
          class="pf-c-button pf-m-primary"
          type="button">
          <span class="pf-c-button__icon pf-m-start">
            <i class="fas fa-play" aria-hidden="true"></i>
          </span>
          Enable
        </button>
      </div>

      <!-- stop is enabled only in started mode-->
      <div class="px-2 text-sm italic  text-gray-400">
        <button
          disabled="{extensionInfo.state !== 'active'}"
          on:click="{() => stopExtension()}"
          class="pf-c-button pf-m-primary"
          type="button">
          <span class="pf-c-button__icon pf-m-start">
            <i class="fas fa-stop" aria-hidden="true"></i>
          </span>
          Disable
        </button>
      </div>
    </div>
  {/if}
</div>

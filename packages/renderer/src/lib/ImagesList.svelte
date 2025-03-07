<script lang="ts">
import { filtered, searchPattern } from '../stores/images';
import type { ImageInfo } from '../../../preload/src/api/image-info';
import type { ImageInspectInfo } from '../../../preload/src/api/image-inspect-info';
import { onMount } from 'svelte';
import ImageEmptyScreen from './image/ImageEmptyScreen.svelte';
import moment from 'moment';
import filesize from 'filesize';
import { router } from 'tinro';
import type { ImageInfoUI } from './image/ImageInfoUI';
import ImageActions from './image/ImageActions.svelte';

let searchTerm = '';
$: searchPattern.set(searchTerm);

let images: ImageInfoUI[] = [];

onMount(async () => {
  filtered.subscribe(value => {
    images = value.map((imageInfo: ImageInfo) => {
      return {
        id: imageInfo.Id,
        shortId: getShortId(imageInfo.Id),
        humanCreationDate: getHumanDate(imageInfo.Created),
        humanSize: getHumanSize(imageInfo.Size),
        name: getName(imageInfo),
        engineId: getEngineId(imageInfo),
        engineName: getEngineName(imageInfo),
        tag: getTag(imageInfo),
      };
    });
  });
});

// extract SHA256 from image id and take the first 12 digits
function getShortId(id: string): string {
  if (id.startsWith('sha256:')) {
    id = id.substring('sha256:'.length);
  }
  return id.substring(0, 12);
}

function gotoBuildImage(): void {
  router.goto('/images/build');
}

function getHumanSize(size: number): string {
  return filesize(size);
}

function getHumanDate(date: number): string {
  return moment(date * 1000).fromNow();
}

function getName(imageInfo: ImageInfo) {
  // get name
  if (!imageInfo.RepoTags) {
    return '<none>';
  }
  return imageInfo.RepoTags.map(tag => {
    return tag.split(':')[0];
  }).join(',');
}

function getTag(imageInfo: ImageInfo) {
  if (!imageInfo.RepoTags) {
    return '<none>';
  }
  return imageInfo.RepoTags.map(tag => {
    return tag.split(':')[1];
  }).join(',');
}

function getEngineId(containerInfo: ImageInfo): string {
  return containerInfo.engineId;
}

function getEngineName(containerInfo: ImageInfo): string {
  return containerInfo.engineName;
}
</script>

<div class="flex flex-col">
  <div class="min-w-full">
    <div class="flex flex-row">
      <div class="py-5 px-5 lg:w-[35rem] w-[22rem]">
        <div class="flex items-center bg-gray-700 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-6 h-6 ml-2 mr-2 "
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            bind:value="{searchTerm}"
            type="text"
            name="containerSearchName"
            placeholder="Search...."
            class="w-full py-2 outline-none bg-gray-700" />
        </div>
      </div>
      <div class="flex flex-1 justify-end">
        <div class="py-5 px-5">
          <button on:click="{() => gotoBuildImage()}" class="pf-c-button pf-m-primary" type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-cube" aria-hidden="true"></i>
            </span>
            Build Image
          </button>
        </div>
      </div>
    </div>
    <table class="min-w-full divide-y divide-gray-800 border-t border-t-zinc-700">
      <tbody class="bg-zinc-800 divide-y divide-zinc-700">
        {#each images as image}
          <tr class="group hover:cursor-pointer hover:bg-zinc-700">
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="ml-4">
                  <div class="flex flex-row">
                    <div class="text-sm text-gray-200">{image.name}</div>
                    <div class="pl-2 text-sm text-violet-400">{image.shortId}</div>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-500">
                    <div>{image.tag}</div>
                    <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-900 text-slate-400">
                      {image.engineName}
                    </div>
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="ml-2 text-sm text-gray-200">{image.humanCreationDate}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex">
                <div class="w-full text-right text-sm text-gray-200">{image.humanSize}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap">
              <div class="hidden group-hover:flex flex-row justify-end">
                <ImageActions image="{image}" />
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
<ImageEmptyScreen images="{$filtered}" />

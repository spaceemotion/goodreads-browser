<template>
  <div class="flex space-x-12">
    <!-- Sidebar -->
    <div class="flex flex-col space-y-6 w-60 flex-none">
      <!-- Logo -->
      <div>
        <img src="https://s.gr-assets.com/assets/layout/header/goodreads_logo.svg" class="w-full" />
        <div class="text-center text-lg font-bold -mt-2 text-brown-800">&mdash; Browser &mdash;</div>
      </div>

      <!-- Options -->
      <Field label="Database">
        <input
          type="file"
          accept=".json"
          multiple
          class="
            rounded-md p-1 border-2 bg-white focus:border-brown-800 focus:outline-none w-full flex-grow
            file:mr-2 file:py-1.5 file:px-2.5
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-brown-100 file:text-brown-800
          "
          @change="updateDatabase"
        >
      </Field>

      <Field label="Includes">
        <textarea
          v-model="includeQuery"
          rows=6
          placeholder="Search Title, Series and Author (comma-separated)"
          class="rounded-md px-2 py-2 border-2 focus:border-brown-800 focus:outline-none w-full flex-grow"
        />
      </Field>

      <Field label="Excludes">
        <textarea
          v-model="excludeQuery"
          rows=6
          placeholder="Search Title, Series and Author (comma-separated)"
          class="rounded-md px-2 py-2 border-2 focus:border-brown-800 focus:outline-none w-full flex-grow"
        />
      </Field>

      <Field label="Year">
        <div class="flex space-x-1">
          <input type="number" placeholder="Since" v-model="yearFrom" min="0" max="2999" step="1" class="rounded-md px-3 py-2 border-2 focus:border-brown-800 focus:outline-none w-full" />
          <input type="number" placeholder="Until" v-model="yearTo" min="0" max="2999" step="1" class="rounded-md px-3 py-2 border-2 focus:border-brown-800 focus:outline-none w-full" />
        </div>
      </Field>

      <Field label="Rating">
        <div class="flex space-x-1">
          <input type="number" placeholder="From" v-model="ratingFrom" min="0" max="5" step="0.01" class="rounded-md px-3 py-2 border-2 focus:border-brown-800 focus:outline-none w-full" />
          <input type="number" placeholder="To" v-model="ratingTo" min="0" max="5" step="0.01" class="rounded-md px-3 py-2 border-2 focus:border-brown-800 focus:outline-none w-full" />
        </div>
      </Field>

      <Field label="Sorting">
        <div class="flex space-x-1">
          <select v-model="sort" class="rounded-md px-3 py-2 border-2 focus:border-brown-800 focus:outline-none w-full">
            <option value="title">Title</option>
            <option value="rating">Rating</option>
            <option value="ratings">Ratings</option>
            <option value="publishedAt">Year</option>
            <option value="series">Series</option>
          </select>
          <select v-model="order" class="rounded-md px-3 py-2 border-2 focus:border-brown-800 focus:outline-none">
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </Field>

      <Field label="Display">
        <div class="flex flex-col space-y-0.5">
          <label>
            <input
              v-model="groupSeries"
              type="checkbox"
            />
            Only show first in series <span class="text-stone-400">(beta)</span>
          </label>
          <label>
            <input
              v-model="onlySeries"
              type="checkbox"
            />
            Only show series
          </label>
          <label>
            <input
              v-model="hideSeen"
              type="checkbox"
            />
            Hide seen <span class="text-stone-500">({{ booksSeenCount }})</span>
          </label>
        </div>
      </Field>

      <button
        type="button"
        class="px-6 py-2 rounded-md font-semibold bg-stone-200 hover:bg-brown-400 text-brown-800 bg-tramsparent transition-colors"
        @click="reset"
      >
        Reset
      </button>
    </div>

    <!-- Main content -->
    <div class="space-y-8 flex-grow">
      <!-- Pagination -->
      <div class="flex items-center justify-between">
        <button
          type="button"
          :disabled="page < 1"
          class="px-2 py-2 rounded-md h-12 w-36 font-semibold shadow-md bg-brown-800 text-brown-200 transition-colors hover:bg-brown-800/80 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed whitespace-nowrap inline-flex justify-center items-center space-x-1"
          @click="movePage(-1)"
        >
          <svg aria-hidden="true" focusable="false" class="w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M176.1 103C181.7 107.7 184 113.8 184 120S181.7 132.3 176.1 136.1L81.94 232H488C501.3 232 512 242.8 512 256s-10.75 24-24 24H81.94l95.03 95.03c9.375 9.375 9.375 24.56 0 33.94s-24.56 9.375-33.94 0l-136-136c-9.375-9.375-9.375-24.56 0-33.94l136-136C152.4 93.66 167.6 93.66 176.1 103z"></path></svg>
          <span>Previous</span>
        </button>

        <div class="text-center text-stone-600 font-semibold leading-none">
          <div class="font-bold text-lg" v-text="title" />
          {{ amount.toLocaleString('en') }} book(s) found
          <span v-if="amount > 0">(Page {{ page + 1 }} of {{ Math.ceil(amount / perPage)}})</span>
        </div>

        <button
          type="button"
          :disabled="page >= Math.floor(amount / perPage)"
          class="px-2 py-2 rounded-md h-12 w-36 font-semibold shadow-md bg-brown-800 text-brown-200 transition-colors hover:bg-brown-800/80 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed whitespace-nowrap inline-flex justify-center items-center space-x-1"
          @click="movePage(1)"
        >
          <span>Next</span>
          <svg aria-hidden="true" focusable="false" class="w-4" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M335 408.1C330.3 404.3 328 398.2 328 392s2.344-12.28 7.031-16.97L430.1 280H24C10.75 280 0 269.2 0 255.1C0 242.7 10.75 232 24 232h406.1l-95.03-95.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l136 136c9.375 9.375 9.375 24.56 0 33.94l-136 136C359.6 418.3 344.4 418.3 335 408.1z"></path></svg>
        </button>
      </div>

      <!-- Loading progress -->
      <div v-if="isLoading" class="py-48 flex items-center space-y-3 flex-col justify-center">
        <svg aria-hidden="true" focusable="false" class="w-8 h-8 text-brown-800 animate-spin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 256c0 36.59-7.83 71.34-21.77 102.8c-5.834 13.17-21.64 18.65-34.15 11.5c-10.5-5.996-15.06-18.94-10.12-29.98C457.5 314.6 464 286 464 256c0-107.7-82.26-196.5-187.2-206.1C264.8 47.84 256 37.34 256 25.36c0-14.52 12.8-25.45 27.23-23.92C411.6 15.08 512 124 512 256z"></path></svg>

        <span class="text-lg text-stone-700 font-semibold">
          Reading Database {{ databases - loadCounter + 1 }}/{{ databases || 1 }}
        </span>

        <div class="rounded-full h-4 bg-stone-200 p-[3px] w-1/3 shadow-inner">
          <div class="bg-brown-800 shadow rounded-full h-full" :style="{width: `${((databases - loadCounter) / databases) * 100}%`}" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="books.length === 0" class="py-48 flex items-center flex-col justify-center">
        <svg aria-hidden="true" focusable="false" class="text-stone-200 w-12 h-12 mb-6" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M160 384l127.1 .0001V128L160 128V384zM96 .0028H31.1C14.37 .0028 0 14.38 0 32v63.1l128-.0008l.0008-63.1C128 14.38 113.6 .0028 96 .0028zM160 479.1c0 17.62 14.37 31.1 32 31.1h63.1c17.62 0 31.98-14.36 31.1-31.98l0-64.02h-127.1L160 479.1zM0 479.1c0 17.62 14.37 31.1 31.1 31.1h64c17.62 0 31.1-14.37 31.1-31.1L128 416H0V479.1zM0 384l128-.0001V128L0 128V384zM419.9 116.2l-123.6 33.04l66.21 246.7l123.7-33.04L419.9 116.2zM510.9 455.3l-16.48-61.67l-123.6 33.05l16.55 61.66c4.559 16.98 22.15 27.12 39.17 22.57l61.85-16.52C505.4 489.8 515.5 472.3 510.9 455.3zM395 23.64c-4.568-16.98-22.15-27.1-39.16-22.55l-61.78 16.52c-3.072 .8203-5.619 2.484-8.197 4.07c-4.348-12.52-15.93-21.68-29.9-21.68h-63.1c-17.63 0-32 14.37-32 31.1L160 96l122 .0014l6.004 22.37l123.5-33.05L395 23.64z"></path></svg>
        <span class="text-lg text-stone-400 font-semibold">
          No books found
        </span>
      </div>

      <!-- Book grid -->
      <ul v-else class="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <li
          v-for="item in books"
          :key="item.id"
          :class="booksSeen[item.id] ? 'border-brown-400' : 'bg-stone-100'"
          class="flex space-x-2 rounded-lg border"
        >
          <a
          :class="booksSeen[item.id] ? 'shadow-sm' : 'shadow-md'"
            class="
              block
              rounded
              bg-white
              p-0.5
              m-1
              flex-none
              hover:ring-2 hover:ring-brown-800 hover:scale-[1.06] hover:-rotate-[0.7deg] origin-bottom hover:shadow-xl
              transition-all
              ease-in
              duration-75
              self-start
              group
            "
            :href="item.url"
            target="_blank"
            rel="nofollow"
          >
            <img
              :src="item.coverUrl"
              :class="{'opacity-40 sepia-[.66] group-hover:sepia-0 group-hover:opacity-100': booksSeen[item.id]}"
              class="w-24 h-36 object-cover transition-all rounded duration-150 ease-out"
              @error="hideImg"
            />
          </a>

          <div class="flex-grow flex flex-col space-y-1.5 pt-3 pb-2 pr-2">
            <div class="leading-none">
              <div class="font-semibold text-brown-800">{{ item.title.replace(/\(.*\)/, "") }}</div>
              <div class="text-stone-600 text-sm mt-1 leading-none">{{ item.series }}</div>
            </div>

            <span class="text-stone-600 text-sm flex-grow">
              by
              <a v-for="author in item.authors" :key="author.name" :href="author.url" v-text="author.name" class="hover:underline" />
            </span>

            <div class="flex space-x-2.5 text-stone-600 text-sm font-semibold">
              <div v-if="item.publishedAt !== null" class="flex items-center">
                <svg aria-hidden="true" focusable="false" class="w-4 h-4 mr-1 text-stone-400" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M128 0C141.3 0 152 10.75 152 24V64H296V24C296 10.75 306.7 0 320 0C333.3 0 344 10.75 344 24V64H384C419.3 64 448 92.65 448 128V192H48V448C48 456.8 55.16 464 64 464H262.5L257.4 484.2C255.1 493.6 255.7 503.2 258.8 512H64C28.65 512 0 483.3 0 448V128C0 92.65 28.65 64 64 64H104V24C104 10.75 114.7 0 128 0V0zM296 256C309.3 256 320 266.7 320 280C320 293.3 309.3 304 296 304H120C106.7 304 96 293.3 96 280C96 266.7 106.7 256 120 256H296zM96 376C96 362.7 106.7 352 120 352H232C245.3 352 256 362.7 256 376C256 389.3 245.3 400 232 400H120C106.7 400 96 389.3 96 376zM564.1 250.1C579.8 265.7 579.8 291 564.1 306.7L534.7 336.1L463.8 265.1L493.2 235.7C508.8 220.1 534.1 220.1 549.8 235.7L564.1 250.1zM311.9 416.1L441.1 287.8L512.1 358.7L382.9 487.9C378.8 492 373.6 494.9 368 496.3L307.9 511.4C302.4 512.7 296.7 511.1 292.7 507.2C288.7 503.2 287.1 497.4 288.5 491.1L303.5 431.8C304.9 426.2 307.8 421.1 311.9 416.1V416.1z"></path></svg>
                {{ item.publishedAt }}
              </div>

              <div v-if="item.rating > 0" class="flex items-center justify-end">
                <svg aria-hidden="true" focusable="false" class="w-4 h-4 mr-1 text-stone-400" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M528.5 171.5l-146.4-21.29l-65.43-132.4C310.9 5.971 299.4-.002 287.1 0C276.6 0 265.1 5.899 259.3 17.8L193.8 150.2L47.47 171.5C21.2 175.3 10.68 207.6 29.72 226.1l105.9 102.1L110.6 474.6C107 495.3 123.6 512 142.2 512c4.932 0 10.01-1.172 14.88-3.75L288 439.6l130.9 68.7c4.865 2.553 9.926 3.713 14.85 3.713c18.61 0 35.21-16.61 31.65-37.41l-25.05-145.5l105.9-102.1C565.3 207.6 554.8 175.3 528.5 171.5zM390.2 320.6l22.4 130.1l-117.2-61.48c-4.655-2.442-10.21-2.442-14.87 .0001L163.4 450.7l22.4-130.1C186.7 315.4 184.1 310.1 181.2 306.4l-94.7-92.09l130.9-19.04C222.6 194.5 227.1 191.2 229.4 186.5L288 67.99l58.59 118.5c2.331 4.717 6.833 7.986 12.04 8.744l130.9 19.04l-94.7 92.09C391 310.1 389.3 315.4 390.2 320.6z"></path></svg>
                {{ item.rating }}
              </div>

              <div class="flex-grow text-right">
                <button
                  type="button"
                  :class="
                    booksSeen[item.id]
                      ? 'bg-brown-800 text-white'
                      :'bg-transparent hover:bg-brown-400 text-brown-800'
                  "
                  class="rounded-full px-1 py-0.5 font-semibold text-sm inline-flex items-center transition-colors duration-75"
                  @click="toggleSeen(item.id)"
                >
                  <svg v-if="booksSeen[item.id]" aria-hidden="true" focusable="false" class="w-4 h-4 inline" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM371.8 211.8l-128 128C238.3 345.3 231.2 348 224 348s-14.34-2.719-19.81-8.188l-64-64c-10.91-10.94-10.91-28.69 0-39.63c10.94-10.94 28.69-10.94 39.63 0L224 280.4l108.2-108.2c10.94-10.94 28.69-10.94 39.63 0C382.7 183.1 382.7 200.9 371.8 211.8z"></path></svg>
                  <svg v-else aria-hidden="true" focusable="false" class="w-4 h-4 inline" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M335 175L224 286.1L176.1 239c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94l64 64C211.7 341.7 217.8 344 224 344s12.28-2.344 16.97-7.031l128-128c9.375-9.375 9.375-24.56 0-33.94S344.4 165.7 335 175zM256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208S370.7 464 256 464z"></path></svg>
                  <span class="px-1 font-semibold">Seen</span>
                </button>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div class="text-center">
        <button
          v-if="books.length > 0"
          type="button"
          class="px-6 py-2 rounded-md font-semibold bg-stone-200 hover:bg-brown-400 text-brown-800 bg-tramsparent transition-colors"
          @click="openCurrentPage"
        >
          Open All
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import { computed, ref, watch } from "vue";
import { orderBy } from "lodash";
import { ignorableWatch, useStorage } from "@vueuse/core";
import { merge } from '../../src/mergeBook';

import Field from "./components/Field.vue";

import type { Book, DatabaseContents } from "../../src/types";

const splitQuery = (query: string): string[] =>
  query
    .toLowerCase()
    .split(",")
    .map((q) => q.trim())
    .filter((q) => q.length > 2);

const useRange = (name: string, from: number, to: number) => ({
  from: useStorage<number>(`${name}From`, from),
  to: useStorage<number>(`${name}To`, to),
});

const cleanSeries = (series: string): string => (
  //`${series}`.replace(/[\-#,;\d\s\(\)]/g, '').toLowerCase().trim()
  `${series}`.toLowerCase().replace(/[^a-z]/g, '').trim()
)

export default defineComponent({
  components: {
    Field,
  },

  setup() {
    const booksSeen = useStorage<Record<number, boolean>>('booksSeen', {});

    const title = ref('');
    const books = ref<Book[]>([]);
    const loadCounter = ref(0);
    const databases = ref(0);
    const isLoading = computed(() => loadCounter.value > 0);

    const deduplicated = computed(() => Object.values(
      books.value.reduce<Record<number, Book>>(merge, {})
    ));

    const groupSeries = useStorage('groupSeries', true);
    const onlySeries = useStorage('onlySeries', false);
    const hideSeen = useStorage('hideSeen', false);

    const groupedBySeries = computed(() => {
      const list = (
        onlySeries.value
          ? deduplicated.value.filter((book) => book.series)
          : deduplicated.value
      );

      if (!groupSeries.value) {
        return list;
      }

      const noSeries = 'NO_SERIES';
      const bySeries = list.reduce<Record<string, Book[]>>((acc, book) => {
        const series = cleanSeries(book.series ?? '') || noSeries;

        if (!(series in acc)) {
          acc[series] = [];
        }

        acc[series].push(book);

        return acc;
      }, {})

      const { [noSeries]: concat = [], ...rest} = bySeries;

      return Object
        .values(rest)
        .map((list) => (
          list.sort((a, b) => (
            // Do a natural sort (1, 2, ..., 10, 11, ...)
            a.series?.replace(',', '').localeCompare(
              b.series?.replace(',', ''),
              'en',
              { numeric: true },
            )
          ))[0]
        ))
        .concat(concat);
    });

    const includeQuery = useStorage("includeQuery", "");
    const includes = computed(() => splitQuery(includeQuery.value));

    const excludeQuery = useStorage("excludeQuery", "");
    const excludes = computed(() => splitQuery(excludeQuery.value));

    const { from: yearFrom, to: yearTo } = useRange('year', 0, 2999);
    const { from: ratingFrom, to: ratingTo } = useRange('rating', 0, 5);

    const filtered = computed<Book[]>(() =>
      groupedBySeries.value.filter((book: Book) => {
        // Hide books based on flag
        if (hideSeen.value && booksSeen.value[book.id]) {
          return false;
        }

        // Year filter
        const publishedYear = book.publishedAt ?? 0;

        if (
          (yearFrom.value && publishedYear < yearFrom.value) ||
          (yearTo.value && publishedYear > yearTo.value) ||
          (ratingFrom.value && book.rating < ratingFrom.value) ||
          (ratingTo.value && book.rating > ratingTo.value)
        ) {
          return false;
        }

        // Text filter for title, series and author
        const title = book.title.toLowerCase();
        const author = book.authors.map(a => a.name).join(' ').toLowerCase();

        return (
          (includes.value.length === 0 ||
            includes.value.find(
              (q) => title.includes(q) || author.includes(q)
            ) !== undefined) &&
          (excludes.value.length === 0 ||
            excludes.value.find(
              (q) => title.includes(q) || author.includes(q)
            ) === undefined)
        );
      })
    );

    const sort = useStorage('sortField', "title");
    const order = useStorage<'asc'|'desc'>('sortOrder', "asc");

    const sorted = computed<Book[]>(() =>
      sort.value === 'series'
        ? orderBy(filtered.value, (book: Book) => book.series?.toLowerCase(), order.value)
        : orderBy(filtered.value, sort.value, order.value)
    );

    const perPage = 24;
    const page = useStorage('currentPage', 0);
    const amount = computed(() => sorted.value.length);

    const { ignoreUpdates: ignorePageReset } = ignorableWatch([sorted], () => {
      page.value = 0;
    });

    const currentPageBooks = computed(() =>
      sorted.value.slice(page.value * perPage, page.value * perPage + perPage)
    );

    // Go back one page when hiding a book creates a blank page
    watch([page, currentPageBooks], ([pageId, books]) => {
      if (pageId > 0 && books.length === 0) {
        page.value--;
      }
    });

    return {
      title,

      isLoading,
      loadCounter,
      databases,

      groupSeries,
      onlySeries,
      hideSeen,

      booksSeen,
      booksSeenCount: computed(() => Object.values(booksSeen.value).filter(v => v).length),

      includeQuery,
      excludeQuery,

      includes,
      excludes,

      sort,
      order,
      page,

      yearFrom,
      yearTo,
      ratingFrom,
      ratingTo,

      perPage,
      amount,

      books: currentPageBooks,

      updateDatabase(e: Event) {
        const fileList = (e.target as HTMLInputElement).files;
        if (fileList.length < 1) {
          return;
        }

        books.value = [];
        title.value = '';
        databases.value = fileList.length;

        const loadCallback = (event: ProgressEvent<FileReader>) => {
          const db: DatabaseContents = JSON.parse(event.target.result + '');
          books.value = books.value.concat(db.books ?? []);

          if (fileList.length === 1 && db.title && !title.value) {
            title.value = db.title;
          }

          loadCounter.value--;
        };

        for (let fileIdx = 0; fileIdx < fileList.length; fileIdx++) {
          const reader = new FileReader();

          reader.addEventListener('load', loadCallback);
          reader.addEventListener('error', () => {
            loadCounter.value--;
          });

          loadCounter.value++;

          reader.readAsText(fileList.item(fileIdx));
        }
      },

      movePage(delta: number) {
        page.value = Math.max(
          0,
          Math.min(Math.ceil(amount.value / perPage) - 1, page.value + delta)
        );
      },

      hideImg(e: Event) {
        (e.currentTarget as HTMLImageElement).src =
          "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/nophoto/book/111x148.png";
      },

      toggleSeen(id: number) {
        ignorePageReset(() => {
          booksSeen.value[id] = !(booksSeen.value[id] ?? false);
        });
      },

      reset() {
        includeQuery.value = '';
        excludeQuery.value = '';
        sort.value = 'title';
        order.value = 'asc';
        yearFrom.value = 0;
        yearTo.value = 2999;
        ratingFrom.value = 0;
        ratingTo.value = 5;
      },

      openCurrentPage() {
        currentPageBooks.value.map((book) => book.url).forEach((url) => window.open(url, '_blank'));
      },
    };
  },
});
</script>

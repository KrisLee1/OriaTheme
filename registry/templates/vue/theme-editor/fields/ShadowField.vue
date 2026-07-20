<script setup lang="ts">
import { computed } from "vue";
import type { ShadowLayer } from "@oriatheme/core";
import type { TokenFieldProps } from "../types";
import FieldFrame from "./FieldFrame.vue";
import ShadowPreview from "../shadows/ShadowPreview.vue";
import ShadowLayerEditor from "../shadows/ShadowLayerEditor.vue";
const props = defineProps<TokenFieldProps>();
const layers = computed(() => Array.isArray(props.value) ? props.value as readonly ShadowLayer[] : []);
const set = (next: readonly ShadowLayer[]): void => props.session.setToken(props.mode, props.field.path, next);
</script>
<template><FieldFrame v-bind="props"><ShadowPreview :layers="layers" /><details data-oria-editor-shadow-details><summary><span><strong>Shadow layers</strong><small>{{ layers.length }} {{ layers.length === 1 ? "layer" : "layers" }}</small></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5" /></svg></summary><div data-oria-editor-shadow-layer-list><ShadowLayerEditor v-for="(layer,index) in layers" :key="index" :layer="layer" :index="index" @change="next => set(layers.map((item,itemIndex) => itemIndex === index ? next : item))" @delete="set(layers.filter((_,itemIndex) => itemIndex !== index))" /></div><button data-oria-editor-shadow-add type="button" @click="set([...layers,{x:'0',y:'4px',blur:'12px',spread:'0',color:'#00000026'}])"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>Add layer</button></details></FieldFrame></template>

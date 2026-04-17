<template>
  <RecycleScroller
    class="virtual-list"
    :items="items"
    :item-size="itemSize"
    key-field="id"
    v-slot="{ item }"
  >
    <div class="resume-item">
      <slot :item="item"></slot>
    </div>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

// 组件属性
interface Props {
  items: any[];
  itemSize: number;
}

const props = defineProps<Props>();
</script>

<style scoped>
.virtual-list {
  height: 100%;
  overflow-y: auto;
}

.resume-item {
  width: 100%;
  box-sizing: border-box;
}
</style>

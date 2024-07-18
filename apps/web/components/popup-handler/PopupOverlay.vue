<script setup lang="ts">
import { usePopupsStore } from '~/store/popups.store';
import { EPopupStatus, EPopupType } from '~/types/popup.type';

const s = usePopupsStore();

// onMounted(() => {
//   // setInterval(() => {
//   //   s.add({
//   //     headline: "Hello there info",
//   //     details: ["general kenobi"],
//   //     timeout: 5000,
//   //     type: EPopupType.Info
//   //   })
//   // }, 1000);
//
//   setInterval(() => {
//     s.add({
//       headline: "Hello there warning",
//       details: ["general kenobi"],
//       timeout: 10000,
//       type: EPopupType.Warning
//     })
//   }, 5000);
//   //
//   // setInterval(() => {
//   //   s.add({
//   //     headline: "Hello there error",
//   //     details: ["general kenobi", "is a general named Kenobi"],
//   //     timeout: 50000,
//   //     type: EPopupType.Error
//   //   })
//   // }, 5000);
// })
</script>

<template>
  <div class="popup-overlay">
    <TransitionGroup name="popups" tag="ul" class="popups">
      <li v-for="el in s.queue" :key="el.id" :data-type="el.type">
        <div class="popups-title-group">
          <h3 class="popups-headline">
            <Icon v-if="el.type === EPopupType.Error" name="material-symbols:error-outline" />
            <Icon v-else-if="el.type === EPopupType.Warning" name="material-symbols:warning-outline" />
            <Icon v-else name="material-symbols:chat-info-outline" />
            <span>{{ el.headline }}</span>
          </h3>
          <button type="button" @click="s.handle(el.id)" class="popups-close-btn">
            <Icon name="material-symbols:close" />
          </button>
        </div>
        <ul class="popups-details" v-if="el.details.length">
          <li v-for="det in el.details"> {{ det }} </li>
        </ul>
      </li>
    </TransitionGroup>
  </div>
</template>

<style lang="scss" scoped>
.popup-overlay {
  width: 350px;
  background: rgba(255, 0, 0, 0.2);
  // background: red;

  position: fixed;
  top: 0;
  right: 0;

  z-index: 69420;
}

.popups {
  width: 350px;
  position: absolute;
  top: var(--padding-half);
  right: var(--padding-half);


  >li {
    position: relative;
    border-radius: var(--radius);
    border: 1px solid var(--stroke-light);
    box-shadow: 2px 2px 8px var(--stroke-light);

    padding: var(--padding);

    &:not(:last-child) {
      margin-bottom: var(--padding-quarter);
    }

    &[data-type=error] {
      color: var(--text);
      background: var(--error);
    }

    &[data-type=warning] {
      color: var(--background);
      background: var(--warn);
    }

    &[data-type=info] {
      color: var(--background);
      background: var(--info-solid);
    }

    &[data-type=success] {
      color: var(--background);
      background: var(--success);
    }
  }

  &-close-btn {
    border: 0;
    background: none;
    padding: 0;
    width: 20px;
    height: 20px;

    cursor: pointer;

    svg {
      width: 100%;
      height: 100%;
      color: var(--stroke);
    }
  }

  &-title-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--padding-double);
  }

  &-headline {
    font-size: var(--font-small);
    display: flex;
    align-items: center;
    gap: var(--padding-half);

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &-details {
    margin-top: var(--padding-half);
    padding-left: 4px;
    padding-right: 22px;

    list-style-position: inside;

    >li {
      list-style: inside;
    }
  }
}

.popups-move,
.popups-enter-active,
.popups-leave-active {
  transition: all 0.5s ease;
}

.popups-enter-from,
.popups-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.popups-leave-active {
  position: absolute !important;
}
</style>

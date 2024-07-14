/**
 * 페이지 이동시 스크롤 움직임을 smooth가 아닌 instant로 설정하기 위해 기본 router.scrollBehavior 옵션을 아래 링크의 소스코드를 그대로 붙여넣기 하여 수정함.
 * 이상 있을 시 사용중인 Nuxt 프로젝트 버전으로 아래 링크 참고하여 수정할 것
 * 참고: https://github.com/nuxt/nuxt/blob/v3.7.4/packages/nuxt/src/pages/runtime/router.options.ts#L9
 */

import type { RouteLocationNormalized, RouterScrollBehavior } from '#vue-router';
import { nextTick } from 'vue';
import type { RouterConfig } from 'nuxt/schema';
import { useNuxtApp } from '#app/nuxt';
import { useRouter } from '#app/composables/router';
// @ts-expect-error virtual file
import { appPageTransition as defaultPageTransition } from '#build/nuxt.config.mjs';

type ScrollPosition = Awaited<ReturnType<RouterScrollBehavior>>;

// Default router options
// https://router.vuejs.org/api/#routeroptions
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    // @ts-expect-error untyped, nuxt-injected option
    const behavior = useRouter().options?.scrollBehaviorType ?? 'instant';

    // By default when the returned position is falsy or an empty object, vue-router will retain the current scroll position
    // savedPosition is only available for popstate navigations (back button)
    let position: ScrollPosition = savedPosition || undefined;

    const routeAllowsScrollToTop = !!(typeof to.meta.scrollToTop === 'function' ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop);

    // Scroll to top if route is changed by default
    // to.meta.scrollToTop이 true라면 그 값을 우선 적용하도록 구현
    if (from && to && routeAllowsScrollToTop && _isDifferentRoute(from, to)) {
      position = { left: 0, top: 0, behavior };
    }

    // Hash routes on the same page, no page hook is fired so resolve here
    if (to.path === from.path) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0, behavior };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
      }
    }

    // Wait for `page:transition:finish` or `page:finish` depending on if transitions are enabled or not
    const hasTransition = (route: RouteLocationNormalized) => !!(route.meta.pageTransition ?? defaultPageTransition);
    const hookToWait = hasTransition(from) && hasTransition(to) ? 'page:transition:finish' : 'page:finish';
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce(hookToWait, async () => {
        await nextTick();
        if (to.hash) {
          position = { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior };
        }
        resolve({ ...position, behavior });
      });
    });
  },
};

function _getHashElementScrollMarginTop(selector: string): number {
  try {
    const elem = document.querySelector(selector);
    if (elem) {
      return parseFloat(getComputedStyle(elem).scrollMarginTop);
    }
  } catch {}
  return 0;
}

function _isDifferentRoute(from: RouteLocationNormalized, to: RouteLocationNormalized): boolean {
  return to.path !== from.path || JSON.stringify(from.params) !== JSON.stringify(to.params);
}

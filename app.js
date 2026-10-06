const menuButton = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
const narrowScreen = window.matchMedia(
  "(max-width: 820px), (max-width: 900px) and (max-height: 500px) and (pointer: coarse)",
);
function closeMenu() {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "打开导航菜单");
  mobileNav.hidden = true;
}
menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuButton.setAttribute(
    "aria-label",
    expanded ? "打开导航菜单" : "关闭导航菜单",
  );
  mobileNav.hidden = expanded;
});
mobileNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNav && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus({ preventScroll: true });
  }
});
const header = document.querySelector(".site-header");
function updateHeaderHeight() {
  if (header)
    document.documentElement.style.setProperty(
      "--visible-header-height",
      `${header.offsetHeight}px`,
    );
}
updateHeaderHeight();
if (header) new ResizeObserver(updateHeaderHeight).observe(header);
document.addEventListener("pointerdown", (event) => {
  if (mobileNav && !mobileNav.hidden && !header.contains(event.target))
    closeMenu();
});
header?.addEventListener("focusout", (event) => {
  if (!header.contains(event.relatedTarget)) closeMenu();
});
narrowScreen.addEventListener("change", () => {
  const focusWasInMenu = mobileNav?.contains(document.activeElement);
  closeMenu();
  if (focusWasInMenu)
    (menuButton.getClientRects().length
      ? menuButton
      : header.querySelector(".brand")
    )?.focus({ preventScroll: true });
});
function updateHeader() {
  header?.classList.toggle("scrolled", window.scrollY > 12);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// The public demo is local and deterministic. It never calls a model or store API.
const scenes = {
  product: {
    question: "这款保温杯是什么材质？容量多大呀？",
    answer: "这款保温杯的内胆是 304 不锈钢，容量为 500ml，日常通勤携带很方便。",
    source: "引用：保温杯商品资料",
    label: "依据本店知识",
    step: "核对回复依据",
  },
  shipping: {
    question: "现在下单，大概什么时候发货？",
    answer:
      "本店现货商品通常在付款后 48 小时内发货。具体进度以订单物流信息为准，您也可以提供订单情况让人工进一步核实。",
    source: "引用：本店发货规则（演示）",
    label: "依据本店规则",
    step: "核对回复依据",
  },
  refund: {
    question: "收到的杯子有破损，可以给我退款吗？",
    answer:
      "很抱歉给您带来不便。可以先提供商品破损照片与订单情况，我会将问题交给人工客服，核实后协助您处理。",
    source: "处理方式：转人工核实，不执行退款",
    label: "需要人工处理",
    step: "转人工核实",
  },
};

function setupTabs(selector, onSelect) {
  const tabs = [...document.querySelectorAll(selector)];
  const separatePanels =
    new Set(tabs.map((tab) => tab.getAttribute("aria-controls"))).size > 1;
  function select(tab, focus = false) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      if (separatePanels)
        document.getElementById(item.getAttribute("aria-controls")).hidden =
          !selected;
    });
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    panel?.setAttribute("aria-labelledby", tab.id);
    onSelect?.(tab);
    const tabList = tab.closest(".capability-tabs");
    if (tabList && tabList.scrollWidth > tabList.clientWidth) {
      const bounds = tab.getBoundingClientRect();
      const listBounds = tabList.getBoundingClientRect();
      const left =
        bounds.left < listBounds.left
          ? bounds.left - listBounds.left
          : Math.max(0, bounds.right - listBounds.right);
      tabList.scrollBy({ left, behavior: "instant" });
    }
    if (focus) tab.focus({ preventScroll: true });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab, true));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        select(tabs[next], true);
      }
    });
  });
}
setupTabs('.capability-tabs [role="tab"]');

const heroPreview = document.querySelector(".hero-preview");
function sizeHeroPreview() {
  if (!heroPreview) return;
  const summary = heroPreview.querySelector(":scope > summary");
  const focusedContent =
    heroPreview.contains(document.activeElement) &&
    document.activeElement !== summary;
  heroPreview.open =
    !narrowScreen.matches ||
    location.hash === "#demo-preview" ||
    focusedContent;
  if (!narrowScreen.matches && document.activeElement === summary)
    heroPreview
      .querySelector('[role="tab"][aria-selected="true"]')
      ?.focus({ preventScroll: true });
}
sizeHeroPreview();
narrowScreen.addEventListener("change", sizeHeroPreview);

// Settle disclosures before positioning the heading; native hash scrolling can
// otherwise use the height of the chapter that is about to close.
function openDisclosure(disclosure) {
  const group = disclosure.getAttribute("name");
  if (group)
    document.querySelectorAll("details[name]").forEach((other) => {
      if (other !== disclosure && other.getAttribute("name") === group)
        other.open = false;
    });
  disclosure.open = true;
}
function revealTarget(hash) {
  if (!hash || hash === "#") return;
  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  for (let disclosure = target?.closest("details"); disclosure;) {
    openDisclosure(disclosure);
    disclosure = disclosure.parentElement?.closest("details");
  }
  return target;
}
let anchorFrame;
function focusWithoutScrolling(element) {
  const temporaryTabIndex =
    !element.hasAttribute("tabindex") && element.tabIndex < 0;
  if (temporaryTabIndex) {
    element.tabIndex = -1;
    element.addEventListener(
      "blur",
      () => element.removeAttribute("tabindex"),
      { once: true },
    );
  }
  element.focus({ preventScroll: true });
}
function positionReadingTarget(
  target,
  { focus = false, instant = false } = {},
) {
  cancelAnimationFrame(anchorFrame);
  anchorFrame = requestAnimationFrame(() => {
    const summary =
      target.matches("details") && target.querySelector(":scope > summary");
    const heading =
      summary && summary.getClientRects().length ? summary : target;
    const offset = (header?.offsetHeight || 0) + 16;
    const main = document.querySelector("main");
    if (main?.contains(heading)) {
      // Short chapters and the last homepage section need enough trailing
      // scroll room for their heading to reach the same reading position.
      main.style.setProperty("--anchor-end-space", "0px");
      const remaining =
        document.documentElement.scrollHeight -
        (heading.getBoundingClientRect().top + window.scrollY);
      main.style.setProperty(
        "--anchor-end-space",
        `${Math.max(0, Math.ceil(window.innerHeight - offset - remaining))}px`,
      );
    }
    if (focus) focusWithoutScrolling(heading);
    window.scrollTo({
      top: heading.getBoundingClientRect().top + window.scrollY - offset,
      behavior:
        instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
    });
  });
}
function clearReadingSpace() {
  document
    .querySelector("main")
    ?.style.setProperty("--anchor-end-space", "0px");
}
function captureReadingState() {
  return {
    chapter: document.querySelector(".guide-section[open]")?.id || "",
    demoOpen: heroPreview?.open,
    left: window.scrollX,
    top: window.scrollY,
    endSpace:
      document
        .querySelector("main")
        ?.style.getPropertyValue("--anchor-end-space") || "0px",
    focus: document.activeElement,
  };
}
let unanchoredReadingState = captureReadingState();
function navigateToAnchor(
  hash,
  { history = false, focus = false, instant = false } = {},
) {
  const previousState =
    history && !location.hash ? captureReadingState() : null;
  const target = revealTarget(hash);
  if (!target) return false;
  if (previousState) unanchoredReadingState = previousState;
  dismissImageForNavigation();
  closeMenu();
  syncChapterSelector();
  if (history && location.hash !== hash)
    window.history.pushState(null, "", hash);
  positionReadingTarget(target, { focus, instant });
  return true;
}
function restoreUnanchoredReadingState() {
  cancelAnimationFrame(anchorFrame);
  dismissImageForNavigation();
  closeMenu();
  document.querySelectorAll(".guide-section").forEach((chapter) => {
    chapter.open = chapter.id === unanchoredReadingState.chapter;
  });
  if (heroPreview)
    heroPreview.open = !narrowScreen.matches || unanchoredReadingState.demoOpen;
  document
    .querySelector("main")
    ?.style.setProperty("--anchor-end-space", unanchoredReadingState.endSpace);
  syncChapterSelector();
  anchorFrame = requestAnimationFrame(() => {
    const previousFocus = unanchoredReadingState.focus;
    const main = document.querySelector("main");
    if (
      previousFocus !== document.body &&
      previousFocus?.isConnected &&
      previousFocus.getClientRects().length
    )
      focusWithoutScrolling(previousFocus);
    else if (main) focusWithoutScrolling(main);
    window.scrollTo({
      left: unanchoredReadingState.left,
      top: unanchoredReadingState.top,
      behavior: "instant",
    });
  });
}
document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const questionSummary = event.target.closest(".faq-list details > summary");
  if (
    questionSummary &&
    !event.target.closest("a, button, input, select, textarea")
  ) {
    event.preventDefault();
    const question = questionSummary.parentElement;
    if (question.open) {
      question.open = false;
      cancelAnimationFrame(anchorFrame);
      clearReadingSpace();
    } else {
      openDisclosure(question);
      positionReadingTarget(questionSummary, { focus: true });
    }
    return;
  }
  const summary = event.target.closest(".guide-section > summary");
  if (summary && !event.target.closest("a, button, input, select, textarea")) {
    event.preventDefault();
    const chapter = summary.parentElement;
    if (chapter.open) {
      chapter.open = false;
      cancelAnimationFrame(anchorFrame);
      clearReadingSpace();
      syncChapterSelector();
    } else navigateToAnchor(`#${chapter.id}`, { history: true, focus: true });
    return;
  }
  const link = event.target.closest("a[href]");
  if (
    !link ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self")
  )
    return;
  const url = new URL(link.href, location.href);
  if (
    url.origin === location.origin &&
    url.pathname === location.pathname &&
    url.search === location.search &&
    url.hash
  ) {
    if (navigateToAnchor(url.hash, { history: true, focus: true }))
      event.preventDefault();
  }
});
window.addEventListener("hashchange", () => {
  dismissImageForNavigation();
  closeMenu();
  if (location.hash)
    navigateToAnchor(location.hash, { instant: true, focus: true });
  else restoreUnanchoredReadingState();
});
window.addEventListener("pageshow", (event) => {
  if (!event.persisted) navigateToAnchor(location.hash, { instant: true });
});
revealTarget(location.hash);

for (const group of ["guide-chapters", "home-questions"]) {
  const disclosures = [
    ...document.querySelectorAll(`details[name="${group}"]`),
  ];
  disclosures.forEach((disclosure) =>
    disclosure.addEventListener("toggle", () => {
      if (disclosure.open)
        disclosures.forEach((other) => {
          if (other !== disclosure) other.open = false;
        });
    }),
  );
}
setupTabs('.demo-tabs [role="tab"]', (tab) => {
  const scene = scenes[tab.dataset.scene];
  document.querySelector("#demo-question").textContent = scene.question;
  document.querySelector("#demo-answer").textContent = scene.answer;
  document.querySelector("#demo-source").textContent = scene.source;
  document.querySelector("#demo-result-label").textContent = scene.label;
  document.querySelector("#demo-final-step").textContent = scene.step;
  document
    .querySelector("#demo-evidence")
    .classList.toggle("human-evidence", tab.dataset.scene === "refund");
});

const screenshots = {
  knowledge: {
    src: "assets/product-knowledge.png",
    alt: "客服精灵知识与资料界面：本店商家资料采集、待审核知识与发布记录，展示模拟商品",
    description: "商家资料先整理为候选，审核发布后，再用于接待。",
  },
  continuity: {
    src: "assets/product-continuity.png",
    alt: "客服精灵接待与提醒设置界面：桌面提醒、无人值守接待与远程提醒，展示模拟店铺",
    description:
      "接待与提醒状态清楚可见，无人值守仍以通电、联网和原店授权为前提。",
  },
};
setupTabs('.product-tabs [role="tab"]', (tab) => {
  const selected = screenshots[tab.dataset.product];
  const screenshot = document.querySelector("#product-screenshot");
  screenshot.src = selected.src;
  screenshot.alt = selected.alt;
  document.querySelector("#product-description").textContent =
    selected.description;
});

const imageDialog = document.querySelector(".image-dialog");
const imageOpeners = [...document.querySelectorAll("[data-open-image]")];
let imageOpener;
const closeButton = document.querySelector(".dialog-close");
const dialogZoom = document.querySelector(".dialog-zoom");
let previousOverflow = "";
let dialogScrollLocked = false;
let returnImageFocus = true;
function dismissImageForNavigation() {
  if (dialogScrollLocked) returnImageFocus = false;
  if (imageDialog?.open) imageDialog.close();
}
imageOpeners.forEach((opener) =>
  opener.addEventListener("click", () => {
    if (imageDialog.open) return;
    closeMenu();
    opener.focus({ preventScroll: true });
    imageOpener = opener;
    returnImageFocus = true;
    const screenshot = document.querySelector("#product-screenshot");
    const image = imageDialog.querySelector("img");
    image.src = screenshot.src;
    image.alt = screenshot.alt;
    document.querySelector("#image-dialog-title").textContent =
      document.querySelector(
        '.product-tabs [aria-selected="true"]',
      ).textContent;
    imageDialog.classList.remove("image-zoomed");
    dialogZoom.setAttribute("aria-pressed", "false");
    dialogZoom.textContent = "查看实际尺寸";
    if (!dialogScrollLocked) {
      previousOverflow = document.body.style.overflow;
      dialogScrollLocked = true;
    }
    document.body.style.overflow = "hidden";
    imageDialog.showModal();
    closeButton.focus({ preventScroll: true });
    imageDialog.querySelector(".dialog-image-wrap").scrollTo(0, 0);
  }),
);
closeButton?.addEventListener("click", () => imageDialog.close());
imageDialog?.addEventListener("click", (event) => {
  const bounds = imageDialog.getBoundingClientRect();
  if (
    event.target === imageDialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  )
    imageDialog.close();
});
imageDialog?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = [
    ...imageDialog.querySelectorAll(
      "button, a[href], input, select, textarea, [tabindex]",
    ),
  ].filter(
    (element) =>
      !element.matches(":disabled") &&
      element.tabIndex >= 0 &&
      element.getClientRects().length,
  );
  if (!controls.length) return;
  const current = controls.indexOf(document.activeElement);
  const next = event.shiftKey
    ? current <= 0
      ? controls.length - 1
      : current - 1
    : (current + 1) % controls.length;
  event.preventDefault();
  controls[next].focus({ preventScroll: true });
});
imageDialog
  ?.querySelector(".dialog-image-wrap")
  .addEventListener("keydown", (event) => {
    if (
      !imageDialog.classList.contains("image-zoomed") ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const direction = {
      ArrowDown: { top: 48 },
      ArrowUp: { top: -48 },
      ArrowRight: { left: 48 },
      ArrowLeft: { left: -48 },
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    event.currentTarget.scrollBy({ ...direction, behavior: "instant" });
  });
function toggleZoom() {
  const zoomed = imageDialog.classList.toggle("image-zoomed");
  dialogZoom.setAttribute("aria-pressed", String(zoomed));
  dialogZoom.textContent = zoomed ? "适应窗口" : "查看实际尺寸";
}
dialogZoom?.addEventListener("click", toggleZoom);
imageDialog?.querySelector("img").addEventListener("click", toggleZoom);
imageDialog?.addEventListener("close", () => {
  // A queued close event from the previous opening must not unlock or steal
  // focus from a dialog that was already reopened.
  if (imageDialog.open) return;
  document.body.style.overflow = previousOverflow;
  dialogScrollLocked = false;
  if (returnImageFocus) imageOpener?.focus({ preventScroll: true });
});

const chapterSelector = document.querySelector("#guide-chapter");
function syncChapterSelector() {
  const openChapter = document.querySelector(".guide-section[open]");
  if (chapterSelector) chapterSelector.value = openChapter?.id || "";
}
chapterSelector?.addEventListener("change", () => {
  if (!chapterSelector.value) return;
  navigateToAnchor(`#${chapterSelector.value}`, { history: true, focus: true });
});
document
  .querySelectorAll(".guide-section")
  .forEach((chapter) =>
    chapter.addEventListener("toggle", syncChapterSelector),
  );
window.addEventListener("hashchange", syncChapterSelector);
syncChapterSelector();

const osButtons = [...document.querySelectorAll("[data-os]")];
osButtons.forEach((button) =>
  button.addEventListener("click", () => {
    osButtons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    document.querySelectorAll("[data-os-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.osPanel !== button.dataset.os;
    });
  }),
);

// Remember only this browser's reading checklist; no data is sent anywhere.
const checklistItems = [...document.querySelectorAll("[data-checklist] input")];
try {
  const saved = JSON.parse(
    localStorage.getItem("genie-guide-checklist") || "[]",
  );
  checklistItems.forEach((item) => {
    item.checked = Array.isArray(saved) && saved.includes(item.id);
  });
} catch {
  /* Reading the guide does not depend on storage access. */
}
function updateChecklist() {
  const complete = checklistItems.filter((item) => item.checked);
  const status = document.querySelector("#checklist-status");
  if (status)
    status.textContent = `${complete.length} / ${checklistItems.length} 项准备完成`;
  try {
    if (checklistItems.length)
      localStorage.setItem(
        "genie-guide-checklist",
        JSON.stringify(complete.map((item) => item.id)),
      );
  } catch {
    /* Storage may be unavailable in private browsers. */
  }
}
checklistItems.forEach((item) =>
  item.addEventListener("change", updateChecklist),
);
updateChecklist();

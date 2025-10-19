// @ts-nocheck
import { animate, inView } from 'motion';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setFinalState = (element: Element) => {
  const target = element as HTMLElement;
  target.style.opacity = '1';
  target.style.transform = 'none';
};

const revealElement = (element: Element, index = 0, fallbackStagger = 0.08) => {
  const target = element as HTMLElement;
  const direction = target.dataset.motionDirection ?? 'up';
  const itemStagger = Number(target.dataset.motionStagger ?? fallbackStagger);
  const delay = Number(target.dataset.motionDelay ?? '0') + index * itemStagger;
  const duration = Number(target.dataset.motionDuration ?? '0.7');
  const distance = Number(target.dataset.motionDistance ?? '32');

  let translateX = 0;
  let translateY = 0;

  switch (direction) {
    case 'down':
      translateY = -distance;
      break;
    case 'left':
      translateX = distance;
      break;
    case 'right':
      translateX = -distance;
      break;
    case 'up':
    default:
      translateY = distance;
      break;
  }

  target.style.opacity = '0';
  target.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;

  requestAnimationFrame(() => {
    animate(
      target,
      {
        opacity: [0, 1],
        transform: [`translate3d(${translateX}px, ${translateY}px, 0)`, 'translate3d(0, 0, 0)']
      },
      {
        delay,
        duration,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    );
  });
};

const initSingleReveals = () => {
  const elements = document.querySelectorAll('[data-motion-reveal]');
  if (prefersReducedMotion.matches) {
    elements.forEach(setFinalState);
    return;
  }

  elements.forEach((element) => {
    inView(
      element,
      () => {
        revealElement(element, 0, 0.08);
      },
      {
        margin: '0px 0px -10% 0px'
      }
    );
  });
};

const initGroupedReveals = () => {
  const groups = document.querySelectorAll('[data-motion-group]');
  if (!groups.length) return;

  if (prefersReducedMotion.matches) {
    groups.forEach((group) => {
      group.querySelectorAll('[data-motion-child]').forEach(setFinalState);
    });
    return;
  }

  groups.forEach((group) => {
    const children = Array.from(group.querySelectorAll('[data-motion-child]'));
    if (!children.length) return;

    const stagger = Number((group as HTMLElement).dataset.motionStagger ?? '0.08');

    inView(
      group,
      () => {
        children.forEach((child, index) => {
          revealElement(child, index, stagger);
        });
      },
      {
        amount: 0.3
      }
    );
  });
};

const initMotion = () => {
  initSingleReveals();
  initGroupedReveals();
};

if (document.readyState !== 'loading') {
  initMotion();
} else {
  document.addEventListener('DOMContentLoaded', initMotion, { once: true });
}

prefersReducedMotion.addEventListener('change', () => {
  if (prefersReducedMotion.matches) {
    document
      .querySelectorAll('[data-motion-reveal], [data-motion-child]')
      .forEach(setFinalState);
  }
});

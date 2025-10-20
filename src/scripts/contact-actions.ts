const COPY_ATTRIBUTE = 'data-copy';
const SUCCESS_CLASS = 'copy-success';
const DEFAULT_CLASS = 'copy-default';
const ACTIVE_BORDER_CLASS = 'border-accent';
const SUCCESS_TIMEOUT = 2000;

const resetButtonState = (button: HTMLElement) => {
  const defaultLabel = button.querySelector<HTMLElement>(`.${DEFAULT_CLASS}`);
  const successLabel = button.querySelector<HTMLElement>(`.${SUCCESS_CLASS}`);

  if (defaultLabel && successLabel) {
    defaultLabel.classList.remove('hidden');
    successLabel.classList.add('hidden');
  }

  button.classList.remove(ACTIVE_BORDER_CLASS);
};

const handleCopy = async (button: HTMLElement) => {
  const value = button.getAttribute(COPY_ATTRIBUTE);
  if (!value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    const defaultLabel = button.querySelector<HTMLElement>(`.${DEFAULT_CLASS}`);
    const successLabel = button.querySelector<HTMLElement>(`.${SUCCESS_CLASS}`);

    if (defaultLabel && successLabel) {
      defaultLabel.classList.add('hidden');
      successLabel.classList.remove('hidden');
    }

    button.classList.add(ACTIVE_BORDER_CLASS);

    window.setTimeout(() => {
      resetButtonState(button);
    }, SUCCESS_TIMEOUT);
  } catch (error) {
    window.location.href = `mailto:${value}`;
  }
};

const initializeButton = (button: HTMLElement) => {
  if (button.dataset.copyInitialized === 'true') {
    return;
  }

  button.dataset.copyInitialized = 'true';

  button.addEventListener('click', () => {
    handleCopy(button);
  });

  button.addEventListener('blur', () => {
    resetButtonState(button);
  });
};

const enhanceCopyButtons = () => {
  const buttons = Array.from(
    document.querySelectorAll<HTMLElement>(`[${COPY_ATTRIBUTE}]`)
  );

  buttons.forEach(initializeButton);
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceCopyButtons, {
      once: true
    });
  } else {
    enhanceCopyButtons();
  }

  document.addEventListener('astro:after-swap', () => {
    window.requestAnimationFrame(() => {
      enhanceCopyButtons();
    });
  });
}
